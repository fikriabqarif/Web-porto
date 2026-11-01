"""Final state: public routes, clean DB, clean upload dirs."""
import os
import subprocess
import sys

sys.path.insert(0, "/home/peleduys/web_porto/.nanobot/verify")
from vhttp import Session

PSQL = "postgresql://webporto:webporto_dev@127.0.0.1:5432/webporto"


def q(sql):
    r = subprocess.run(["psql", PSQL, "-At", "-c", sql], capture_output=True, text=True)
    return (r.stdout or r.stderr).strip()


s = Session()
slugs = [x for x in q('select slug from "Project" order by slug;').splitlines() if x]
paths = ["/", "/about", "/cv", "/projects", "/notes", "/contact", "/sitemap.xml", "/robots.txt"]
paths += [f"/projects/{x}" for x in slugs]

print("=== public routes ===")
bad = []
for p in paths:
    r = s.get(p)
    flag = "OK " if r.status == 200 else "BAD"
    if r.status != 200:
        bad.append((p, r.status))
    print(f"{flag} {r.status} {p}")

zz = [p for p in ["/projects", "/notes"] if "zz-verify" in s.get(p).text]
print("\nzz-verify leaks in listings:", zz or "none")

# clean the files the verify suite just wrote
pub = "/home/peleduys/web_porto/public"
removed = []
for d in os.listdir(pub):
    p = os.path.join(pub, d)
    if os.path.isdir(p):
        for name in os.listdir(p):
            os.remove(os.path.join(p, name))
            removed.append(f"/{d}/{name}")
        os.rmdir(p)
print("stray upload files removed:", removed or "none")
print("public/ now:", os.listdir(pub) or "empty")

print("\n=== DB ===")
print("projects:", q('select count(*) from "Project";'),
      "| published:", q('select count(*) from "Project" where "published" is true;'),
      "| images:", q('select count(*) from "ProjectImage";'),
      "| posts:", q('select count(*) from "Post";'),
      "| messages:", q('select count(*) from "Message";'))
print("\nserver still alive after all requests:", s.get("/").status)
print("failures:", bad or "none")
