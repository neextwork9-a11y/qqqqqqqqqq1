import { rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const vite = resolve(root, "node_modules", "vite", "bin", "vite.js");
rmSync(resolve(root, "dist-netlify"), { recursive: true, force: true });
const result = spawnSync(process.execPath, [vite, "build", "--mode", "netlify"], {
  cwd: root,
  env: { ...process.env, LIFE_OS_TARGET: "netlify" },
  stdio: "inherit",
});

if (result.error) throw result.error;
if (result.signal) throw new Error(`Netlify build was terminated by ${result.signal}`);

process.exitCode = result.status ?? 1;
