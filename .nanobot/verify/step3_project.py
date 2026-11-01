"""SPEC 12.5(a) — create project with 2 uploaded images, publish, verify /projects + detail page."""
import json
import re
import subprocess
import sys

sys.path.insert(0, "/home/peleduys/web_porto/.nanobot/verify")
from vhttp import ADMIN, Session, action_fields, png, strip_tags

SLUG = "zz-verify-project"
TITLE = "ZZ Verify Harness Project"
DESC = """## Overview
This is a **verification** project created by the automated SPEC check.

- first bullet
- second bullet

Inline `code` plus a [link](https://example.com)."""


def login():
    s = Session()
    page = s.get(ADMIN + "/login")
    fields = action_fields(page.text)
    fields["from"] = ADMIN
    fields["email"] = "fikriabqarifawwaz@gmail.com"
    fields["password"] = "porto-dev-2026"
    r = s.post(ADMIN + "/login", fields=fields)
    assert r.status == 303, f"login failed: {r.status}"
    return s


def forms(html):
    out = []
    for chunk in html.split("<form")[1:]:
        body = chunk.split("</form>")[0]
        hidden = {}
        for m in re.finditer(r'<input[^>]*type="hidden"[^>]*>', body):
            tag = m.group(0)
            n = re.search(r'name="([^"]*)"', tag)
            v = re.search(r'value="([^"]*)"', tag)
            if n:
                val = (v.group(1) if v else "").replace("&quot;", '"').replace("&amp;", "&")
                hidden[n.group(1)] = val
        out.append(hidden)
    return out


s = login()
print("logged in; dashboard:", s.get(ADMIN).status)

# 1. two real image uploads through the admin upload API
files = [
    ("file", "verify-a.png", png(16, 16, (200, 30, 30)), "image/png"),
    ("file", "verify-b.png", png(24, 24, (30, 200, 90)), "image/png"),
]
urls = []
for f in files:
    r = s.post("/api/upload", files=[f, ] , fields={"prefix": "projects"})
    print("upload", f[1], "->", r.status, r.text[:120])
    urls.append(json.loads(r.text)["url"])

unauth = Session().post("/api/upload", files=[files[0]], fields={"prefix": "projects"})
print("upload without session ->", unauth.status, unauth.text[:80])

print("uploaded urls:", urls)
for u in urls:
    disk = "/home/peleduys/web_porto/public" + u
    exists = subprocess.run(["test", "-f", disk]).returncode == 0
    served = s.get(u).status
    print(f"  {u} on disk={exists} served={served}")

# 2. create + publish via the admin form (server-action progressive enhancement)
newpage = s.get(ADMIN + "/projects/new")
act = action_fields(newpage.text)
images = [
    {"url": urls[0], "alt": "Verification image one"},
    {"url": urls[1], "alt": "Verification image two"},
]
fields = dict(act)
fields.update(
    {
        "id": "",
        "title": TITLE,
        "slug": SLUG,
        "summary": "A throwaway project that proves the admin create + publish flow works.",
        "description": DESC,
        "role": "Tester",
        "tags": "verification, test",
        "githubUrl": "",
        "demoUrl": "",
        "images": json.dumps(images),
        "intent": "publish",
    }
)
r = s.post(ADMIN + "/projects/new", fields=fields)
print("\ncreate+publish ->", r.status, "location:", r.header("location"))
if "Please fix" in r.text or "Could not save" in r.text:
    print("!! form error:", strip_tags(r.text)[:600])

# 3. public listing + detail page
listing = s.get("/projects")
detail = s.get(f"/projects/{SLUG}")
print("GET /projects ->", listing.status, "contains title:", TITLE in listing.text)
print(f"GET /projects/{SLUG} ->", detail.status,
      "| title:", TITLE in detail.text,
      "| h2:", "<h2" in detail.text,
      "| strong:", "<strong>" in detail.text,
      "| li:", "<li>" in detail.text,
      "| code:", "<code>" in detail.text,
      "| link:", 'href="https://example.com"' in detail.text)
gallery = re.findall(r'<img[^>]+src="([^"]+)"[^>]*>', detail.text)
alts = re.findall(r'<img[^>]+alt="([^"]*)"', detail.text)
print("images on detail page:", gallery, "alts:", alts)
open("/home/peleduys/web_porto/.nanobot/verify/project-detail.html", "w").write(detail.text)

# 4. DB row
psql = subprocess.run(
    [
        "psql", "postgresql://webporto:webporto_dev@127.0.0.1:5432/webporto", "-At", "-c",
        f'select p.id, p.slug, p.published, count(i.id) from "Project" p left join "ProjectImage" i on i."projectId"=p.id where p.slug=\'{SLUG}\' group by p.id;',
    ],
    capture_output=True, text=True,
)
print("db row (id|slug|published|images):", psql.stdout.strip() or psql.stderr.strip()[:300])
pid = psql.stdout.strip().split("|")[0] if psql.stdout.strip() else ""

# 5. update (CRUD "U") through the edit form
edit = s.get(f"{ADMIN}/projects/{pid}/edit")
print("\nedit page ->", edit.status)
act2 = action_fields(edit.text)
f2 = dict(act2)
f2.update(
    {
        "id": pid,
        "title": TITLE + " (edited)",
        "slug": SLUG,
        "summary": "Updated summary that still exceeds the ten character minimum.",
        "description": DESC + "\n\nEdited after creation.",
        "role": "Tester",
        "tags": "verification, test",
        "githubUrl": "",
        "demoUrl": "",
        "images": json.dumps(images),
        "intent": "publish",
    }
)
r2 = s.post(f"{ADMIN}/projects/{pid}/edit", fields=f2)
print("update ->", r2.status, "location:", r2.header("location"))
d2 = s.get(f"/projects/{SLUG}")
print("detail after edit has '(edited)':", "(edited)" in d2.text, "| images still:", len(re.findall(r'<img[^>]+src="/projects/', d2.text)))
print("PID", pid)
