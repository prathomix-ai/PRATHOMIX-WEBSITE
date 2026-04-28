"""
Lightweight schema migration runner for PRATHOMIX.
Applies SQL migration files in order, tracking which have run
in a migrations table in Supabase.

Run: python3 -m database.migrations

Migration files live in: backend/database/sql/
Naming convention: 001_initial.sql, 002_add_profiles.sql, etc.
"""
import os
import sys
from pathlib import Path
from database.supabase_client import get_client
from utils.logger import get_logger

log = get_logger("migrations")

MIGRATIONS_DIR = Path(__file__).parent / "sql"
MIGRATIONS_TABLE = "schema_migrations"


def _ensure_migrations_table(client) -> None:
    """Create the migrations tracking table if it doesn't exist."""
    client.rpc("exec_sql", {"sql": f"""
        create table if not exists public.{MIGRATIONS_TABLE} (
            id          serial primary key,
            filename    text unique not null,
            applied_at  timestamptz not null default now()
        );
    """}).execute()


def _applied_migrations(client) -> set[str]:
    try:
        result = client.table(MIGRATIONS_TABLE).select("filename").execute()
        return {r["filename"] for r in (result.data or [])}
    except Exception:
        return set()


def _read_sql_files() -> list[tuple[str, str]]:
    """Return sorted list of (filename, sql_content)."""
    if not MIGRATIONS_DIR.exists():
        return []
    files = sorted(MIGRATIONS_DIR.glob("*.sql"))
    return [(f.name, f.read_text()) for f in files]


def run_migrations() -> None:
    log.info("Running database migrations...")
    client = get_client()

    try:
        _ensure_migrations_table(client)
    except Exception as e:
        log.warning(f"Could not create migrations table (may already exist): {e}")

    applied  = _applied_migrations(client)
    all_sql  = _read_sql_files()
    pending  = [(n, sql) for n, sql in all_sql if n not in applied]

    if not pending:
        log.info("Database is up to date. No migrations to run.")
        return

    log.info(f"{len(pending)} migration(s) to apply.")

    for filename, sql in pending:
        log.info(f"  Applying {filename}...")
        try:
            # Run the SQL (requires exec_sql RPC or direct Postgres connection)
            client.rpc("exec_sql", {"sql": sql}).execute()
            client.table(MIGRATIONS_TABLE).insert({"filename": filename}).execute()
            log.info(f"  ✓ {filename} applied.")
        except Exception as e:
            log.error(f"  ✗ {filename} FAILED: {e}")
            sys.exit(1)

    log.info("All migrations applied successfully.")


if __name__ == "__main__":
    run_migrations()
