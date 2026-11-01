// Loads .env into process.env (Next only does this automatically for dev/build),
// then runs `next start`.
const { loadEnvConfig } = require("@next/env");
const { spawn } = require("child_process");
const path = require("path");

const dir = path.resolve(__dirname, "..");
const { loadedEnvFiles } = loadEnvConfig(dir, false, console, true);
console.log(
  "env files:",
  loadedEnvFiles.map((f) => f.path).join(", ") || "(none)",
  "| ADMIN_EMAIL set:",
  Boolean(process.env.ADMIN_EMAIL),
  "| ADMIN_PASSWORD_HASH set:",
  Boolean(process.env.ADMIN_PASSWORD_HASH),
);

const port = process.env.PORT || "3000";
const child = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "-p", port], {
  cwd: dir,
  stdio: "inherit",
  env: process.env,
});
child.on("exit", (code) => process.exit(code ?? 0));
