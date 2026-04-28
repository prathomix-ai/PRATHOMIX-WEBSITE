# PRATHOMIX — Developer Convenience Makefile
.PHONY: help scaffold dev-fe dev-be dev install-fe install-be install \
        test-be test-fe test lint-be lint-fe lint format \
        docker-up docker-down docker-build docker-logs \
        sitemap validate-env seed clean

help:
	@echo ""
	@echo "  PRATHOMIX Makefile Commands"
	@echo "  ─────────────────────────────────────────"
	@echo "  make scaffold        Re-run scaffold generator"
	@echo "  make install         Install all dependencies"
	@echo "  make dev             Start frontend + backend"
	@echo "  make dev-fe          Frontend only (port 5173)"
	@echo "  make dev-be          Backend only  (port 8000)"
	@echo "  make test            Run all tests"
	@echo "  make test-be         pytest backend"
	@echo "  make test-fe         vitest frontend"
	@echo "  make lint            Lint frontend + backend"
	@echo "  make format          Prettier format frontend"
	@echo "  make docker-up       Start Docker Compose"
	@echo "  make docker-down     Stop Docker Compose"
	@echo "  make docker-build    Rebuild Docker images"
	@echo "  make docker-logs     Tail container logs"
	@echo "  make sitemap         Generate sitemap.xml"
	@echo "  make validate-env    Check required env vars"
	@echo "  make seed            Seed Supabase with demo data"
	@echo "  make clean           Remove build artefacts"
	@echo ""

scaffold:
	python3 build_prathomix_fullstack.py

install-fe:
	cd frontend && npm install

install-be:
	cd backend && pip install -r requirements.txt

install: install-fe install-be

dev-fe:
	cd frontend && npm run dev

dev-be:
	cd backend && uvicorn main:app --reload --port 8000

dev:
	@echo "Starting PRATHOMIX..."
	@(cd backend && uvicorn main:app --reload --port 8000 &) && cd frontend && npm run dev

test-be:
	cd backend && pytest tests/ -v --tb=short

test-fe:
	cd frontend && npm run test -- --run

test: test-be test-fe

lint-be:
	cd backend && ruff check . --select E,W,F --ignore E501

lint-fe:
	cd frontend && npm run lint

lint: lint-be lint-fe

format:
	cd frontend && npm run format

docker-build:
	docker compose build

docker-up:
	docker compose up -d
	@echo "Frontend → http://localhost"
	@echo "API Docs → http://localhost:8000/api/docs"

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

sitemap:
	python3 scripts/generate_sitemap.py

validate-env:
	python3 scripts/validate_env.py

seed:
	python3 scripts/seed_data.py

clean:
	rm -rf frontend/dist frontend/node_modules/.cache
	find backend -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find backend -name "*.pyc" -delete 2>/dev/null || true
	@echo "Clean complete."
