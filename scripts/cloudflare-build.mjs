import { spawnSync } from "node:child_process";
import { join } from "node:path";

const cli = join(process.cwd(), "node_modules", "vinext", "dist", "cli.js");
const result = spawnSync(process.execPath, [cli, "build"], {
  stdio: "inherit",
  env: { ...process.env, RANBANK_DEPLOY_TARGET: "cloudflare" },
});

if (result.error) console.error(result.error.message);

process.exit(result.status ?? 1);
