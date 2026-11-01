
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
