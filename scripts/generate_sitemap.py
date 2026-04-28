#!/usr/bin/env python3
"""
Sitemap generator for PRATHOMIX.
Run: python3 scripts/generate_sitemap.py
Outputs: frontend/public/sitemap.xml
"""
import os
from datetime import date

BASE_URL = os.getenv("SITE_URL", "https://prathomix.xyz")

ROUTES = [
    ("",            "1.0",  "daily"   ),
    ("services",    "0.9",  "weekly"  ),
    ("products",    "0.9",  "weekly"  ),
    ("pricing",     "0.85", "weekly"  ),
    ("case-studies","0.85", "monthly" ),
    ("blog",        "0.8",  "daily"   ),
    ("founder",     "0.7",  "monthly" ),
    ("contact",     "0.7",  "monthly" ),
    ("api-docs",    "0.6",  "weekly"  ),
    ("privacy",     "0.4",  "yearly"  ),
    ("terms",       "0.4",  "yearly"  ),
]

def build_sitemap():
    today = date.today().isoformat()
    urls  = []
    for path, priority, freq in ROUTES:
        loc = f"{BASE_URL}/{path}" if path else BASE_URL
        entry = (
            "  <url>\n"
            f"    <loc>{loc}</loc>\n"
            f"    <lastmod>{today}</lastmod>\n"
            f"    <changefreq>{freq}</changefreq>\n"
            f"    <priority>{priority}</priority>\n"
            "  </url>"
        )
        urls.append(entry)

    xml  = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    xml += "\n".join(urls)
    xml += "\n</urlset>\n"

    out = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "sitemap.xml")
    with open(out, "w") as f:
        f.write(xml)
    print(f"Sitemap written → {os.path.abspath(out)}")
    print(f"  {len(urls)} URLs for {BASE_URL}")

if __name__ == "__main__":
    build_sitemap()
