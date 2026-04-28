"""
Pydantic field validators & reusable validator functions.
"""
import re
from pydantic import field_validator


URL_REGEX = re.compile(
    r'^https?://'
    r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'
    r'localhost|'
    r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
    r'(?::\d+)?'
    r'(?:/?|[/?]\S+)$',
    re.IGNORECASE,
)


def is_valid_url(url: str) -> bool:
    return bool(URL_REGEX.match(url))


def validate_github_url(url: str | None) -> str | None:
    if url is None:
        return None
    if not url.startswith('https://github.com/'):
        raise ValueError('github_url must start with https://github.com/')
    return url


def validate_non_empty(value: str) -> str:
    v = value.strip()
    if not v:
        raise ValueError('Field must not be empty.')
    return v
