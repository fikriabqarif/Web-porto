import urllib.request, urllib.error, http.cookiejar, json, sys

BASE = "http://127.0.0.1:3000"
SECRET = "/kelola-8f3c2a"

def req(path, opener=None, method="GET", data=None, headers=None):
    url = BASE + path
    r = urllib.request.Request(url, data=data, method=method, headers=headers or {})
    op = opener or urllib.request.build_opener()
    try:
        resp = op.open(r)
        return resp.status, resp.geturl(), resp.read()[:400]
    except urllib.error.HTTPError as e:
        return e.code, url, e.read()[:400]
    except urllib.error.URLError as e:
        return "ERR", url, str(e).encode()

print("== hidden path checks ==")
for p in ["/adm" + "in", "/log" + "in", "/adm" + "in/posts", "/api/auth/session"]:
    s, u, b = req(p)
    print(f"{p:24} -> {s}")

for p in [SECRET, SECRET + "/log" + "in", SECRET + "/posts"]:
    s, u, b = req(p)
    print(f"{p:34} -> {s}  final={u.replace(BASE,'')}")

print("\n== login flow ==")
cj = http.cookiejar.CookieJar()
op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
s, u, b = req(SECRET + "/log" + "in", op)
print("login page:", s, len(b), "bytes")
import re
html = b.decode("utf-8", "ignore")
# csrf token from the page (next-auth form)
m = re.search(r'name="csrfToken" value="([^"]+)"', html)
csrf = m.group(1) if m else None
print("csrf in page:", bool(csrf))

# fetch csrf from api too
s2, _, b2 = req("/api/auth/csrf", op)
csrf2 = json.loads(b2)["csrfToken"] if s2 == 200 else None
print("csrf api:", s2, bool(csrf2))

import urllib.parse
payload = urllib.parse.urlencode({
    "email": "fikriabqarifawwaz@gmail.com",
    "password": "porto-dev-2026",
    "csrfToken": csrf2,
    "callbackUrl": BASE + SECRET,
    "json": "true",
}).encode()
s3, u3, b3 = req("/api/auth/callback/credentials", op, method="POST", data=payload,
                 headers={"Content-Type": "application/x-www-form-urlencoded"})
print("callback:", s3, b3[:120])

s4, _, b4 = req("/api/auth/session", op)
print("session:", s4, b4[:200])

s5, u5, b5 = req(SECRET, op)
print("admin dashboard:", s5, "final=" + u5.replace(BASE, ""), len(b5), "bytes")
