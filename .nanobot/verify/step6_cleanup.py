"""CRUD 'D' through the admin UI + remove every trace of the verification data."""
import json
import os
import re
import subprocess
import sys

sys.path.insert(0, "/home/peleduys/web_porto/.nanobot/verify")
from vhttp import ADMIN, Session, action_fields

PSQL = "postgresql://webporto:webporto_dev@127.0.0.1:5432/webporto"


def q(sql):
    r = subprocess.run(["psql", PSQL, "-At", "-c", sql], capture_output=True, text=True)
    return (r.stdout or r.stderr).strip()


def login():
    s = Session()
    f = action_fields(s.get(ADMIN + "/login").text)
    f.update({"from": ADMIN, "email": "fikriabqarifawwaz@gmail.com", "password": "porto-dev-2026"})
    r = s.post(ADMIN + "/login", fields=f)
    assert r.status == 303, r.status
    return s


def form_for_id(html, target_id):
    """Return the hidden fields of the <form> that carries name="id" value=target_id."""
    for chunk in html.split("<form")[1:]:
        body = chunk.split("</form>")[0]
        hidden = {}
        for m in re.finditer(r'<input[^>]*type="hidden"[^>]*>', body):
            tag = m.group(0)
            n = re.search(r'name="([^"]*)"', tag)
            v = re.search(r'value="([^"]*)"', tag)
            if n:
                hidden[n.group(1)] = (v.group(1) if v else "").replace("&quot;", '"')
        if hidden.get("id") == target_id:
            return hidden
    return None


s = login()
print("logged in:", s.get(ADMIN).status)

# ---- delete the test project through the admin list form ----
pid = q("select id from \"Project\" where slug='zz-verify-project';")
page = s.get(ADMIN + "/projects")
f = form_for_id(page.text, pid)
print("delete form found for project:", bool(f), "| fields:", list(f.keys()) if f else None)
r = s.post(ADMIN + "/projects", fields=f)
print("delete project ->", r.status, "| remaining rows:",
      q("select count(*) from \"Project\" where slug='zz-verify-project';"))
print("detail page now:", s.get("/projects/zz-verify-project").status)

# ---- delete the test post ----
post_id = q("select id from \"Post\" where slug='zz-verify-post';")
page = s.get(ADMIN + "/posts")
f = form_for_id(page.text, post_id)
print("\ndelete form found for post:", bool(f), "| fields:", list(f.keys()) if f else None)
r = s.post(ADMIN + "/posts", fields=f)
print("delete post ->", r.status, "| remaining rows:",
      q("select count(*) from \"Post\" where slug='zz-verify-post';"))
print("detail page now:", s.get("/notes/zz-verify-post").status)

# ---- delete test messages (direct SQL; they are not admin-deletable in bulk) ----
before = q('select count(*) from "Message";')
q('delete from "Message" where email like \'zz-%\' or name like \'ZZ %\';')
after = q('select count(*) from "Message";')
print("\nmessages:", before, "->", after)
print("remaining message rows:", q('select coalesce(string_agg(name || \'<\' || email || \'>\', \', \'), \'(none)\') from "Message";') or "(none)")

# ---- delete the uploaded test images and stale upload dirs ----
pub = "/home/peleduys/web_porto/public"
referenced = set()
for row in q('select url from "ProjectImage" union select coalesce("cvUrl",\'\') from "Setting";').splitlines():
    if row:
        referenced.add(row.strip())
print("\nreferenced image urls:", sorted(referenced))

removed = []
for d in ("projects", "verify", "cv-verify", "uploads"):
    p = os.path.join(pub, d)
    if not os.path.isdir(p):
        continue
    for name in sorted(os.listdir(p)):
        rel = f"/{d}/{name}"
        if rel in referenced:
            continue
        os.remove(os.path.join(p, name))
        removed.append(rel)
    if not os.listdir(p):
        os.rmdir(p)
print("unreferenced uploads removed:", removed)

# ---- final state ----
print("\n=== final DB state ===")
print("projects:", q('select count(*) from "Project";'), "| posts:", q('select count(*) from "Post";'),
      "| messages:", q('select count(*) from "Message";'),
      "| images:", q('select count(*) from "ProjectImage";'))
print("zz rows left:", q('select (select count(*) from "Project" where slug like \'zz-%\') + (select count(*) from "Post" where slug like \'zz-%\') + (select count(*) from "Message" where email like \'zz-%\');'))
