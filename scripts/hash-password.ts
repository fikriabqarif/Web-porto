/**
 * Prints a bcrypt hash for ADMIN_PASSWORD_HASH.
 *
 *   npm run hash-password            # interactive prompt
 *   npm run hash-password -- hunter2 # inline (careful: shell history)
 */
import { createInterface } from "node:readline/promises";
import { hashSync } from "bcryptjs";

async function readPassword(): Promise<string> {
  const inline = process.argv[2];
  if (inline) return inline;

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question("Password: ");
  rl.close();
  return answer;
}

async function main(): Promise<void> {
  const password = await readPassword();

  if (password.length < 8) {
    console.error("Use at least 8 characters.");
    process.exit(1);
  }

  const hash = hashSync(password, 12);

  // Raw form first: this is what hosting dashboards (Vercel etc.) need, since
  // they store the value literally. The escaped form is only for local .env
  // files, where Next's loader would otherwise expand/strip `$2b`.
  console.log(hash);
  console.error("\nHosting dashboard (Vercel/Netlify/CI secret) -> paste the line above as-is.");
  console.error(`Local .env -> use: ADMIN_PASSWORD_HASH=${hash.replace(/\$/g, "\\$")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
