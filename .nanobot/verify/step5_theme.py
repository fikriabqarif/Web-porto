"""SPEC 12.6 — dark/light toggle: instant, persists, no flash. Static + script-execution proof."""
import re
import subprocess
import sys
import pathlib

sys.path.insert(0, "/home/peleduys/web_porto/.nanobot/verify")
from vhttp import Session

s = Session()
home = s.get("/")
html = home.text
print("GET / ->", home.status, "len", len(html))

head = html.split("</head>")[0]
scripts = re.findall(r"<script([^>]*)>(.*?)</script>", html, flags=re.S)
print("total scripts in document:", len(scripts))
theme_script = None
for attrs, body in scripts:
    if "classList.add" in body and "localStorage.getItem" in body:
        theme_script = body
        print("  theme script attrs:", repr(attrs.strip()), "| len:", len(body), "| in <head>:", body in head)

print("\n<html ...> tag:", re.search(r"<html[^>]*>", html).group(0))
if theme_script:
    idx = html.index(theme_script)
    print("theme script index:", idx, "| <body> index:", html.index("<body"))
    print("inline + blocking (no async/defer on the tag):",
          "async" not in html[max(0, idx - 200):idx] and "defer" not in html[max(0, idx - 200):idx])
print("toggle button markup:", re.search(r"<button[^>]*aria-label=\"[^\"]*theme[^\"]*\"[^>]*>", html).group(0)[:200] if re.search(r"aria-label=\"[^\"]*theme", html) else "NOT FOUND")

out = pathlib.Path("/home/peleduys/web_porto/.nanobot/verify/theme-script.js")
out.write_text(theme_script)
print("saved theme script ->", out, len(theme_script), "bytes")

harness = r"""
const fs = require("fs");
const src = fs.readFileSync(process.argv[2], "utf8");

function run(label, stored, prefersDark) {
  const classes = new Set();
  const docEl = {
    classList: {
      add: (...c) => c.forEach((x) => classes.add(x)),
      remove: (...c) => c.forEach((x) => classes.delete(x)),
      contains: (c) => classes.has(c),
    },
    style: {},
  };
  const store = { ...(stored === null ? {} : { theme: stored }) };
  const document = { documentElement: docEl, querySelector: () => null, addEventListener: () => {}, currentScript: null };
  const localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
  };
  const mql = { matches: prefersDark, addEventListener: () => {}, addListener: () => {}, media: "(prefers-color-scheme: dark)" };
  const window = { matchMedia: () => mql, localStorage, addEventListener: () => {} };
  new Function("window", "document", "localStorage", "matchMedia", src)(window, document, localStorage, () => mql);
  console.log(
    label.padEnd(34),
    "| html class:", JSON.stringify([...classes].join(" ")),
    "| colorScheme:", JSON.stringify(docEl.style.colorScheme || ""),
    "| stored:", JSON.stringify(store.theme ?? null),
  );
}

run("stored=dark, system=light", "dark", false);
run("stored=light, system=dark", "light", true);
run("stored=null, system=dark", null, true);
run("stored=null, system=light", null, false);
"""
pathlib.Path("/home/peleduys/web_porto/.nanobot/verify/theme-harness.js").write_text(harness)
r = subprocess.run(
    ["node", "/home/peleduys/web_porto/.nanobot/verify/theme-harness.js", str(out)],
    capture_output=True, text=True,
)
print("\n--- executing the site's real inline theme script ---")
print(r.stdout or r.stderr[:1500])

print("--- next-themes persistence implementation ---")
g = subprocess.run(
    ["grep", "-rn", "--include=*.js", "-e", "localStorage.setItem(key", "-e", "localStorage.setItem",
     "/home/peleduys/web_porto/node_modules/next-themes/dist/"],
    capture_output=True, text=True,
)
print((g.stdout or g.stderr).strip()[:600])
