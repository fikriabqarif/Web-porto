"""SPEC 12.4 — wrong password shows a generic error; correct credentials log in."""
import sys

sys.path.insert(0, "/home/peleduys/web_porto/.nanobot/verify")
from vhttp import ADMIN, Session, action_fields

s = Session()

page = s.get(ADMIN + "/login")
print("login page:", page.status)
fields = action_fields(page.text)
print("action fields:", {k: v[:40] for k, v in fields.items()})
assert "$ACTION_KEY" in fields, "no server-action hidden inputs found"

base = dict(fields)
base["from"] = ADMIN

# --- wrong password ---
wrong = dict(base, email="fikriabqarifawwaz@gmail.com", password="definitely-not-the-password")
r = s.post(ADMIN + "/login", fields=wrong)
print("\n[wrong password] status:", r.status, "ctype:", r.header("content-type"))
print("set-cookie:", r.cookies())
print("generic error present:", "Invalid email or password" in r.text)
print("session cookie present:", any("authjs.session-token" in c or "next-auth.session-token" in c for c in r.cookies()))
print("redirect location:", r.header("location"))
cookie_names = [c.name for c in s.jar]
print("jar after wrong attempt:", cookie_names)

# --- wrong email, right password shape ---
wrong2 = dict(base, email="nobody@example.com", password="whatever-123")
r2 = s.post(ADMIN + "/login", fields=wrong2)
print("\n[wrong email] status:", r2.status, "generic error:", "Invalid email or password" in r2.text)
print("leaks which field:", ("password" in r2.text and "email" in r2.text and "Invalid email or password" not in r2.text))

# --- correct credentials ---
good = dict(base, email="fikriabqarifawwaz@gmail.com", password="porto-dev-2026")
r3 = s.post(ADMIN + "/login", fields=good)
print("\n[correct login] status:", r3.status, "location:", r3.header("location"))
print("set-cookie names:", [c.split("=")[0] for c in r3.cookies()])
print("jar now:", [c.name for c in s.jar])

after = s.get(ADMIN)
print("\nGET", ADMIN, "->", after.status, "len", len(after.body))
print("dashboard has 'Signed in'/'Projects' text:", "Projects" in after.text)
open("/home/peleduys/web_porto/.nanobot/verify/admin-dashboard.html", "w").write(after.text)
