#!/bin/sh
set -e
BASE=http://127.0.0.1:3000
JAR=/tmp/porto-jar.txt
rm -f "$JAR"
CSRF=$(curl -s -c "$JAR" "$BASE/api/auth/csrf" | python3 -c 'import json,sys; print(json.load(sys.stdin)["csrfToken"])')
echo "csrf=$CSRF"
curl -s -b "$JAR" -c "$JAR" -D /tmp/porto-headers.txt -o /tmp/porto-body.txt \
  -X POST "$BASE/api/auth/callback/credentials" \
  --data-urlencode "csrfToken=$CSRF" \
  --data-urlencode "email=fikriabqarifawwaz@gmail.com" \
  --data-urlencode "password=porto-dev-2026" \
  --data-urlencode "callbackUrl=$BASE/admin" \
  --data-urlencode "json=true"
echo "--- headers"
cat /tmp/porto-headers.txt
echo "--- body"
cat /tmp/porto-body.txt
echo "--- cookies"
cat "$JAR"
echo "--- session"
curl -s -b "$JAR" "$BASE/api/auth/session"
echo
echo "--- /admin"
curl -s -b "$JAR" -o /dev/null -w "%{http_code} %{redirect_url}\n" "$BASE/admin"
