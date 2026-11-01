const { loadEnvConfig } = require("@next/env");
const { compare } = require("bcryptjs");
const fs = require("fs");

loadEnvConfig(process.cwd(), false, console, true);

const raw = fs.readFileSync(".env", "utf8").match(/^ADMIN_PASSWORD_HASH=(.*)$/m)[1].trim();
const fromEnv = process.env.ADMIN_PASSWORD_HASH ?? "";

console.log("raw        :", JSON.stringify(raw), raw.length);
console.log("from env   :", JSON.stringify(fromEnv), fromEnv.length);
console.log("identical  :", raw === fromEnv);
console.log("email env  :", JSON.stringify(process.env.ADMIN_EMAIL));

(async () => {
  console.log("compare(raw)    :", await compare("porto-dev-2026", raw));
  console.log("compare(env)    :", await compare("porto-dev-2026", fromEnv));
})();
