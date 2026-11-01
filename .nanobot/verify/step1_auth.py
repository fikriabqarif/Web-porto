import re, sys, http.cookiejar, urllib.request, urllib.error

BASE = "http://127.0.0.1:3000"
ADMIN = "/kelola-8f3c2a"


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def opener(follow=True):
    cj = http.cookiejar.CookieJar()
    handlers = [urllib.request.HTTPCookieProcessor(cj)]
    if not follow:
        handlers.append(NoRedirect())
    return urllib.request.build_opener(*handlers), cj


def get(path, follow=False):
    op, cj = opener(follow)
    req = urllib.request.Request(BASE + path, headers={"User-Agent": "verify/1.0"})
    try:
        r = op.open(req, timeout=60)
        body = r.read().decode("utf-8", "replace")
        return r.status, dict(r.headers), body
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), e.read().decode("utf-8", "replace")


print("=== A. logged-out access ===")
for path in ["/admin", "/login", ADMIN, ADMIN + "/projects", ADMIN + "/messages", ADMIN + "/login"]:
    st, hd, body = get(path)
    loc = hd.get("Location") or hd.get("location") or ""
    print(f"{path:28s} -> {st}  location={loc}  len={len(body)}")

st, hd, body = get(ADMIN + "/login")
print("\n--- login page forms/hidden inputs ---")
for m in re.finditer(r"<form[^>]*>", body):
    print(m.group(0)[:300])
for m in re.finditer(r'<input[^>]*type="hidden"[^>]*>', body):
    print(m.group(0)[:300])
print("has $ACTION:", "$ACTION" in body)
print("has name=\"website\":", 'name="website"' in body)
open("/home/peleduys/web_porto/.nanobot/verify/login.html", "w").write(body)
