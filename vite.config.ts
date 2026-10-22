// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isCpanelBuild = process.env["LIFE_OS_TARGET"] === "cpanel";
const isNetlifyBuild = process.env["LIFE_OS_TARGET"] === "netlify";
const cpanelBasePath = process.env["CPANEL_BASE_PATH"] ?? "/";
const cpanelRouterBasePath = cpanelBasePath.replace(/\/$/, "") || "/";

export default defineConfig({
  vite: {
    base: isCpanelBuild ? cpanelBasePath : "/",
    server: {
      proxy: {
        "/backendserver/api": {
          target: "http://127.0.0.1:8090",
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/backendserver/, ""),
        },
      },
    },
  },
  nitro: {
    preset: isCpanelBuild || isNetlifyBuild ? "cloudflare-module" : "netlify",
    ...(isCpanelBuild
      ? {
          output: {
            dir: ".output",
            serverDir: ".output/server",
            publicDir: "dist",
          },
        }
      : isNetlifyBuild
        ? {
            output: {
              dir: ".output-netlify",
              serverDir: ".output-netlify/server",
              publicDir: "dist-netlify",
            },
          }
        : {}),
  },
  tanstackStart: {
    ...(isCpanelBuild || isNetlifyBuild
      ? {
          ...(isCpanelBuild
            ? {
                router: {
                  basepath: cpanelRouterBasePath,
                },
              }
            : {}),
          prerender: {
            enabled: true,
            crawlLinks: true,
            autoStaticPathsDiscovery: true,
            failOnError: true,
            filter: ({ path }: { path: string }) =>
              !path.startsWith("/assets/") && !path.startsWith(`${cpanelBasePath}assets/`),
          },
        }
      : {}),
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
