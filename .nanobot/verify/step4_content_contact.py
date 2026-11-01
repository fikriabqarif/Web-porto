"""SPEC 12.5(b,c) posts + contact + rate limit, and 12.7 honeypot drop."""
import json
import subprocess
import sys
import urllib.error
import urllib.request

sys.path.insert(0, "/home/peleduys/web_porto/.nanobot/verify")
from vhttp import ADMIN, Session, action_fields, strip_tags

POST_SLUG = "zz-verify-post"
POST_TITLE = "ZZ Verify Post"
POST_BODY = "## Why this exists\nA **temporary** note used to prove the admin post flow. `code` too.\n\n- point one\n- point two"
PSQL = "postgresql://webporto:webporto_dev@127.0.0.1:5432/webporto"


def q(sql):
    r = subprocess.run(["psql", PSQL, "-At", "-c", sql], capture_output=True, text=True)
    return (r.stdout or r.stderr).strip()


def login():
    s = Session()
    fields = action_fields(s.get(ADMIN + "/login").text)
    fields["from"] = ADMIN
    fields["email"] = "fikriabqarifawwaz@gmail.com"
    fields["password"] = "porto-dev-2026"
    r = s.post(ADMIN + "/login", fields=fields)
    assert r.status == 303, r.status
    return s


s = login()
print("logged in:", s.get(ADMIN).status)

# ---------- posts ----------
new = s.get(ADMIN + "/posts/new")
f = action_fields(new.text)
f.update(
    {
        "id": "",
        "title": POST_TITLE,
        "slug": POST_SLUG,
        "excerpt": "A temporary note created by the automated SPEC verification run.",
        "body": POST_BODY,
        "tags": "verification, test",
        "intent": "publish",
    }
)
r = s.post(ADMIN + "/posts/new", fields=f)
print("\n[post create] ->", r.status, "location:", r.header("location"))
if "Please fix" in r.text or "Could not save" in r.text:
    print("!! error:", strip_tags(r.text)[:400])

notes = s.get("/notes")
detail = s.get(f"/notes/{POST_SLUG}")
print("GET /notes ->", notes.status, "| title listed:", POST_TITLE in notes.text)
print(f"GET /notes/{POST_SLUG} ->", detail.status,
      "| title:", POST_TITLE in detail.text,
      "| h2:", "<h2" in detail.text,
      "| strong:", "<strong>" in detail.text,
      "| li:", "<li>" in detail.text,
      "| code:", "<code>" in detail.text)
print("db:", q(f"select slug || '|' || \"published\"::text from \"Post\" where slug='{POST_SLUG}';"))

# ---------- contact form (real submission) ----------
contact = s.get("/contact")
cf = action_fields(contact.text)
print("\ncontact page:", contact.status, "| honeypot field in markup:", 'name="website"' in contact.text,
      "| action fields found:", list(cf.keys()))

real_ip = "198.51.100.12"
msg_before = q('select count(*) from "Message";')
body_text = "Please ignore this message — automated SPEC verification of the contact pipeline."
cf_real = dict(cf)
cf_real.update({"name": "ZZ Verify Sender", "email": "zz-verify@example.com", "body": body_text, "website": ""})
r = s.post("/contact", fields=cf_real, headers={"X-Forwarded-For": real_ip})
print("[contact submit] ->", r.status,
      "| success state rendered:", "Thanks — your message has been sent." in r.text,
      "| validation error:", "Please fix the highlighted fields." in r.text)
msg_after = q('select count(*) from "Message";')
print("messages in db:", msg_before, "->", msg_after)
print("db row:", q("select name || '|' || email || '|' || left(body,40) from \"Message\" order by \"createdAt\" desc limit 1;"))

admin_msgs = s.get(ADMIN + "/messages")
print("GET /admin/messages ->", admin_msgs.status,
      "| shows sender:", "ZZ Verify Sender" in admin_msgs.text,
      "| shows email:", "zz-verify@example.com" in admin_msgs.text,
      "| shows body:", "automated SPEC verification" in admin_msgs.text)

# ---------- honeypot ----------
bot_ip = "198.51.100.11"
before_hp = q('select count(*) from "Message";')
hp = dict(cf)
hp.update({"name": "Bot Name", "email": "bot@example.com", "body": "spam spam spam spam spam", "website": "http://spam.example"})
r = s.post("/contact", fields=hp, headers={"X-Forwarded-For": bot_ip})
after_hp = q('select count(*) from "Message";')
print("\n[honeypot] ->", r.status,
      "| pretends success:", "Thanks — your message has been sent." in r.text,
      "| db rows:", before_hp, "->", after_hp,
      "| dropped:", before_hp == after_hp)

# honeypot via the JSON API too
api_before = q('select count(*) from "Message";')
req = urllib.request.Request(
    "http://127.0.0.1:3000/api/contact",
    data=json.dumps({"name": "Bot Two", "email": "bot2@example.com", "body": "more spam spam spam", "website": "http://x.example"}).encode(),
    headers={"Content-Type": "application/json", "X-Forwarded-For": bot_ip},
    method="POST",
)
with urllib.request.urlopen(req, timeout=60) as resp:
    print("[honeypot api] ->", resp.status, resp.read().decode()[:80])
api_after = q('select count(*) from "Message";')
print("api rows:", api_before, "->", api_after, "| dropped:", api_before == api_after)

# ---------- rate limiting (5/hour per IP) ----------
statuses = []
for i in range(5):
    body = {"name": "ZZ Rate Limit", "email": "zz-rate@example.com", "body": f"Rate limit probe number {i} for SPEC verification.", "website": ""}
    req = urllib.request.Request(
        "http://127.0.0.1:3000/api/contact",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "X-Forwarded-For": "203.0.113.7"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            statuses.append((resp.status, ""))
    except urllib.error.HTTPError as e:
        statuses.append((e.code, e.headers.get("Retry-After")))
print("\n[rate limit] same-IP (203.0.113.7) submissions ->", statuses)
print("db messages total:", q('select count(*) from "Message";'))
