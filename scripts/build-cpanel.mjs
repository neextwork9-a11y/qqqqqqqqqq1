import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const vite = resolve(root, "node_modules", "vite", "bin", "vite.js");
const basePathArgument = process.argv
  .slice(2)
  .find((argument) => argument.startsWith("--base-path="))
  ?.slice("--base-path=".length);
const basePath = basePathArgument ?? process.env["CPANEL_BASE_PATH"] ?? "/";
const basePathSegments = basePath.split("/").filter(Boolean);

if (
  (basePath !== "/" && !basePath.startsWith("/")) ||
  !basePathSegments.every((segment) => /^[A-Za-z0-9._~-]+$/.test(segment) && segment !== "." && segment !== "..")
) {
  throw new Error(
    `Invalid cPanel base path "${basePath}". Use "/" or an absolute path such as "/lifeos/".`,
  );
}

const normalizedBasePath =
  basePathSegments.length === 0 ? "/" : `/${basePathSegments.join("/")}/`;
const result = spawnSync(process.execPath, [vite, "build", "--mode", "cpanel"], {
  cwd: root,
  env: {
    ...process.env,
    LIFE_OS_TARGET: "cpanel",
    CPANEL_BASE_PATH: normalizedBasePath,
  },
  stdio: "inherit",
});

if (result.error) throw result.error;
if (result.signal) throw new Error(`cPanel build was terminated by ${result.signal}`);

process.exitCode = result.status ?? 1;
