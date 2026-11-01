"""Dump inline <head> scripts from / to locate the next-themes pre-paint script."""
import re
import sys

sys.path.insert(0, "/home/peleduys/web_porto/.nanobot/verify")
from vhttp import Session

html = Session().get("/").text
head = html.split("</head>")[0]
for i, (attrs, body) in enumerate(re.findall(r"<script([^>]*)>(.*?)</script>", head, flags=re.S)):
    print(f"--- script {i} attrs={attrs.strip()[:80]!r} len={len(body)}")
    print(body[:300].replace("\n", " "))
    print()

full = re.findall(r"<script([^>]*)>(.*?)</script>", html, flags=re.S)
print("=== all scripts containing 'theme' ===")
for attrs, body in full:
    if "theme" in body and "localStorage" in body:
        print("attrs:", attrs.strip()[:100])
        print(body[:1200])
        print("...")
