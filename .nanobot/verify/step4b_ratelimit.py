"""6th submission from the same IP — expect 429 + Retry-After."""
import json
import urllib.error
import urllib.request

body = {
    "name": "ZZ Rate Limit",
    "email": "zz-rate@example.com",
    "body": "Sixth probe should be rejected by the fixed-window limiter.",
    "website": "",
}
req = urllib.request.Request(
    "http://127.0.0.1:3000/api/contact",
    data=json.dumps(body).encode(),
    headers={"Content-Type": "application/json", "X-Forwarded-For": "203.0.113.7"},
    method="POST",
)
try:
    r = urllib.request.urlopen(req, timeout=60)
    print("6th ->", r.status, r.read().decode()[:120])
except urllib.error.HTTPError as e:
    print("6th ->", e.code, "| Retry-After:", e.headers.get("Retry-After"), "|", e.read().decode()[:140])

# a different IP must still be allowed
req2 = urllib.request.Request(
    "http://127.0.0.1:3000/api/contact",
    data=json.dumps(body).encode(),
    headers={"Content-Type": "application/json", "X-Forwarded-For": "203.0.113.99"},
    method="POST",
)
try:
    r = urllib.request.urlopen(req2, timeout=60)
    print("other IP ->", r.status, r.read().decode()[:80])
except urllib.error.HTTPError as e:
    print("other IP ->", e.code, e.read().decode()[:120])

# the contact server action path uses the same limiter
print("messages in db:", urllib.request.urlopen("http://127.0.0.1:3000/").status)
