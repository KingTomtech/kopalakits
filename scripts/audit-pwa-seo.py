#!/usr/bin/env python3
"""PWA + SEO audit for kopala.zingati.app"""
import json
import re
import urllib.request
import sys

BASE = "https://kopala.zingati.app"

paths = [
    "/apple-touch-icon.png",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
    "/maskable-icon.png",
    "/favicon.svg",
    "/logo.png",
    "/og-image.jpg",
    "/manifest.json",
    "/robots.txt",
    "/sitemap.xml",
]

def head(path):
    req = urllib.request.Request(BASE + path, method="HEAD", headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status, r.headers.get("Content-Type", ""), r.headers.get("Content-Length", "")
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get("Content-Type", ""), ""
    except Exception as e:
        return None, str(e), ""

def get(path):
    req = urllib.request.Request(BASE + path, headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status, r.read(), r.headers
    except urllib.error.HTTPError as e:
        return e.code, e.read(), e.headers
    except Exception as e:
        return None, str(e).encode(), {}

print("═══════════════════════════════════════════════")
print("  KOPALA KITS — PWA + SEO AUDIT (post-rebrand)")
print("═══════════════════════════════════════════════")
print()
print("▶ PWA ASSET AVAILABILITY")
for p in paths:
    code, ctype, clen = head(p)
    if code == 200:
        size = f"{int(clen):>7} B" if clen.isdigit() else "       ?"
        print(f"  ✅ {code}  {size}  {p}")
    else:
        print(f"  ❌ {code}  {p}")
print()

# Download the home page once
status, html, _ = get("/")
if status != 200:
    print(f"Home page error: {status}")
    sys.exit(1)
html_str = html.decode("utf-8", errors="replace")

# Check icon dimensions by reading first bytes
def png_dims(path):
    try:
        req = urllib.request.Request(BASE + path, headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
        })
        with urllib.request.urlopen(req, timeout=15) as r:
            data = r.read(24)
        if data[:8] == b"\x89PNG\r\n\x1a\n":
            w = int.from_bytes(data[16:20], "big")
            h = int.from_bytes(data[20:24], "big")
            return f"{w}x{h}"
    except: pass
    return "?"

print("▶ ICON DIMENSIONS (PWA spec compliance)")
print(f"  apple-touch-icon: {png_dims('/apple-touch-icon.png')}  (180x180 iOS)")
print(f"  icon-192:         {png_dims('/icons/icon-192.png')}  (192x192 PWA)")
print(f"  icon-512:         {png_dims('/icons/icon-512.png')}  (512x512 PWA splash)")
print(f"  maskable-icon:    {png_dims('/maskable-icon.png')}  (512x512 Android)")
print()

# Manifest
status, body, _ = get("/manifest.json")
print("▶ PWA MANIFEST")
if status == 200:
    m = json.loads(body)
    checks = [
        ("name present", bool(m.get("name"))),
        ("short_name present", bool(m.get("short_name"))),
        ("display=standalone", m.get("display") == "standalone"),
        ("theme_color present", bool(m.get("theme_color"))),
        ("icons has 192", any(i["sizes"] == "192x192" for i in m.get("icons", []))),
        ("icons has 512", any(i["sizes"] == "512x512" for i in m.get("icons", []))),
        ("maskable icon", any(i.get("purpose") == "maskable" for i in m.get("icons", []))),
        ("shortcuts (>=5)", len(m.get("shortcuts", [])) >= 5),
    ]
    for label, ok in checks:
        print(f"  {'✅' if ok else '❌'} {label}")
    print(f"  ℹ️  {len(m.get('shortcuts', []))} shortcuts: {', '.join(s['short_name'] for s in m.get('shortcuts', []))}")
print()

# Structured data
print("▶ STRUCTURED DATA (Google rich results)")
ld_blocks = re.findall(r'<script type="application/ld\+json">(.+?)</script>', html_str, re.DOTALL)
for block in ld_blocks:
    try:
        d = json.loads(block)
        t = d.get("@type", "Unknown")
        logo = d.get("logo", "—")
        image = d.get("image", "—")
        print(f"  ✅ {t:14}  logo={logo}  image={image}")
    except json.JSONDecodeError as e:
        print(f"  ❌ Parse error: {e}")
print()

# SEO meta tags
print("▶ SEO META TAGS")
seo_checks = {
    "<title>": r"<title>(.+?)</title>",
    "meta description": r'<meta\s+name="description"',
    "meta keywords": r'<meta\s+name="keywords"',
    "canonical": r'rel="canonical"',
    "og:type": r'property="og:type"',
    "og:title": r'property="og:title"',
    "og:description": r'property="og:description"',
    "og:image": r'property="og:image"',
    "og:image:width": r'og:image:width',
    "og:image:height": r'og:image:height',
    "og:locale": r'property="og:locale"',
    "twitter:card": r'twitter:card',
    "twitter:title": r'twitter:title',
    "twitter:image": r'twitter:image',
    "theme-color (light)": r'theme-color.*prefers-color-scheme: light',
    "theme-color (dark)": r'theme-color.*prefers-color-scheme: dark',
    "apple-mobile-web-app-capable": r'apple-mobile-web-app-capable',
    "apple-touch-icon": r'apple-touch-icon',
    "mask-icon": r'mask-icon',
    "msapplication-TileImage": r'msapplication-TileImage',
    "geo.region": r'geo\.region',
    "geo.position": r'geo\.position',
    "robots": r'name="robots"',
    "manifest link": r'rel="manifest"',
    "alternate media": r'rel="alternate"',
}
for label, pat in seo_checks.items():
    found = re.search(pat, html_str)
    print(f"  {'✅' if found else '❌'} {label}")
print()

# Final issues check
print("▶ REGRESSION CHECKS")
# Old favicon.svg should NOT contain the old "shield" path
status, favicon_body, _ = get("/favicon.svg")
old_shield = b"path d=\"M32 2 L60 12" in favicon_body
print(f"  {'❌' if old_shield else '✅'} favicon.svg is new design (no old shield path)")

# Old logo shouldn't appear in og-image
status, og, _ = get("/og-image.jpg")
og_size = len(og)
print(f"  {'✅' if og_size < 100000 else '❌'} og-image.jpg is the new ~54KB version (actual: {og_size:,} bytes)")

# Verify SEO logo URL returns 200
status, _, _ = get("/icons/icon-512.png")
print(f"  {'✅' if status == 200 else '❌'} structured-data logo URL (icons/icon-512.png) is reachable")
print()
print("═══════════════════════════════════════════════")
print("  AUDIT COMPLETE")
print("═══════════════════════════════════════════════")
