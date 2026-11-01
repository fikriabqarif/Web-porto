"""Delete the test project/post through the real admin Delete form (CRUD 'D')."""
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
    assert s.post(ADMIN + "/login", fields=f).status == 303
    return s


def delete_form(html, target_id):
    for chunk in html.split("<form")[1:]:
        body = chunk.split("</form>")[0]
        hidden = {}
        for m in re.finditer(r'<input[^>]*type="hidden"[^>]*>', body):
            tag = m.group(0)
            n = re.search(r'name="([^"]*)"', tag)
            v = re.search(r'value="([^"]*)"', tag)
            if n:
                hidden[n.group(1)] = v.group(1) if v else ""
        if hidden.get("id") == target_id and "Delete" in body:
            return hidden
    return None


s = login()
print("session:", s.get(ADMIN).status)

for kind, table, listing, url_path in [
    ("project", "Project", ADMIN + "/projects", "/projects"),
    ("post", "Post", ADMIN + "/posts", "/notes"),
]:
    slug = "zz-verify-project" if kind == "project" else "zz-verify-post"
    target = q(f"select id from \"{table}\" where slug='{slug}';")
    if not target:
        print(f"{kind}: already gone")
        continue
    page = s.get(listing)
    f = delete_form(page.text, target)
    print(f"\n{kind} delete form: {list(f.keys()) if f else None}")
    r = s.post(listing, fields=f)
    left = q(f"select count(*) from \"{table}\" where id='{target}';")
    print(f"DELETE /{url_path}/{slug} -> action status {r.status} | rows left {left} | public page {s.get(f'{url_path}/{slug}').status}")

# images that pointed at the deleted project must be gone too
print("\nProjectImage rows:", q('select count(*) from "ProjectImage";'))
print("projects:", q('select count(*) from "Project";'), "| posts:", q('select count(*) from "Post";'),
      "| messages:", q('select count(*) from "Message";'))
print("zz leftovers:", q("""select (select count(*) from "Project" where slug like 'zz-%')
 + (select count(*) from "Post" where slug like 'zz-%')
 + (select count(*) from "Message" where email like 'zz-%' or name like 'ZZ %');"""))
print("slug list:", q('select string_agg(slug, \', \' order by slug) from "Project";'))
