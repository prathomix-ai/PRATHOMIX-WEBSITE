"""
Application monitoring middleware.
Tracks request latency, error rates, and logs structured metrics.

Add to main.py:
  from monitoring import PrometheusMiddleware, metrics_endpoint
  app.add_middleware(PrometheusMiddleware)
  app.add_route("/metrics", metrics_endpoint)

For Prometheus + Grafana, install: pip install prometheus-client
"""
import time
import os
from collections import defaultdict
from fastapi import Request, Response
from fastapi.responses import PlainTextResponse
from utils.logger import get_logger

log = get_logger("monitoring")

# In-memory counters (use Prometheus in production)
_request_counts   = defaultdict(int)
_error_counts     = defaultdict(int)
_latency_totals   = defaultdict(float)
_start_time       = time.monotonic()


class MetricsMiddleware:
    """ASGI middleware that records request metrics."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        start    = time.monotonic()
        path     = scope.get("path", "/")
        method   = scope.get("method", "GET")
        key      = f"{method} {path}"
        status   = [200]

        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                status[0] = message["status"]
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        except Exception as exc:
            _error_counts[key] += 1
            raise
        finally:
            elapsed = time.monotonic() - start
            _request_counts[key]  += 1
            _latency_totals[key]  += elapsed

            if elapsed > 2.0:
                log.warning(f"Slow request: {key} took {elapsed:.2f}s")
            if status[0] >= 500:
                _error_counts[key] += 1
                log.error(f"Server error: {key} → {status[0]}")


async def metrics_endpoint(request: Request) -> PlainTextResponse:
    """
    Prometheus-compatible text metrics endpoint.
    Mount at: app.add_route("/metrics", metrics_endpoint)
    """
    uptime   = time.monotonic() - _start_time
    lines    = [
        "# PRATHOMIX Metrics",
        f"# Uptime: {uptime:.0f}s",
        "",
        "# HELP http_requests_total Total HTTP requests",
        "# TYPE http_requests_total counter",
    ]
    for key, count in _request_counts.items():
        safe = key.replace('"', '')
        lines.append(f'http_requests_total{{route="{safe}"}} {count}')

    lines += [
        "",
        "# HELP http_errors_total Total HTTP 5xx errors",
        "# TYPE http_errors_total counter",
    ]
    for key, count in _error_counts.items():
        safe = key.replace('"', '')
        lines.append(f'http_errors_total{{route="{safe}"}} {count}')

    lines += [
        "",
        "# HELP http_latency_seconds_total Cumulative request latency",
        "# TYPE http_latency_seconds_total counter",
    ]
    for key, total in _latency_totals.items():
        safe = key.replace('"', '')
        lines.append(f'http_latency_seconds_total{{route="{safe}"}} {total:.4f}')

    lines += [
        "",
        f'app_uptime_seconds {uptime:.2f}',
        f'app_requests_total {sum(_request_counts.values())}',
        f'app_errors_total   {sum(_error_counts.values())}',
    ]

    return PlainTextResponse("\n".join(lines) + "\n")


def get_stats() -> dict:
    """Return metrics as a dict (used by /api/admin/system)."""
    return {
        "uptime_seconds": round(time.monotonic() - _start_time, 2),
        "total_requests": sum(_request_counts.values()),
        "total_errors":   sum(_error_counts.values()),
        "routes":         dict(_request_counts),
    }
