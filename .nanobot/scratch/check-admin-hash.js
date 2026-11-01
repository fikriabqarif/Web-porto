const { compareSync } = require("bcryptjs");
const fs = require("fs");
const env = fs.readFileSync(".env", "utf8");
const hash = env.match(/^ADMIN_PASSWORD_HASH=(.*)$/m)[1].trim();
const email = env.match(/^ADMIN_EMAIL=(.*)$/m)[1].trim();
console.log("email:", JSON.stringify(email));
console.log("hash:", JSON.stringify(hash), "len:", hash.length);
for (const p of ["porto-dev-2026", "porto-dev-2026\n", "admin", "fikri"]) {
  console.log(JSON.stringify(p), "=>", compareSync(p, hash));
}
