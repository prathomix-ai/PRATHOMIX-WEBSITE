"""
Structured logging setup for the PRATHOMIX backend.
Outputs JSON in production, human-readable in dev.
"""
import logging
import sys
import os

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
IS_PROD   = os.getenv("ENV", "development") == "production"


class _Formatter(logging.Formatter):
    COLORS = {
        'DEBUG':    '\033[36m',
        'INFO':     '\033[32m',
        'WARNING':  '\033[33m',
        'ERROR':    '\033[31m',
        'CRITICAL': '\033[35m',
    }
    RESET = '\033[0m'

    def format(self, record):
        color = self.COLORS.get(record.levelname, self.RESET)
        record.levelname = f"{color}{record.levelname:<8}{self.RESET}"
        return super().format(record)


def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger

    logger.setLevel(getattr(logging, LOG_LEVEL, logging.INFO))
    handler = logging.StreamHandler(sys.stdout)

    if IS_PROD:
        import json
        class JsonFormatter(logging.Formatter):
            def format(self, record):
                return json.dumps({
                    "time":    self.formatTime(record),
                    "level":   record.levelname,
                    "name":    record.name,
                    "message": record.getMessage(),
                })
        handler.setFormatter(JsonFormatter())
    else:
        fmt = '%(asctime)s %(levelname)s [%(name)s] %(message)s'
        handler.setFormatter(_Formatter(fmt, datefmt='%H:%M:%S'))

    logger.addHandler(handler)
    logger.propagate = False
    return logger
