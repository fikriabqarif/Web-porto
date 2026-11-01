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

  console.log(hashSync(password, 12).replace(/\$/g, "\\$"));
  console.error("\nCopy that into ADMIN_PASSWORD_HASH (the \\$ escapes are required in .env).");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
