# Life OS

Life OS is a TanStack Start application built with React, Vite, and Tailwind CSS. This repository is also connected to [Lovable](https://lovable.dev) and can be edited in the [Life OS Lovable project](https://lovable.dev/projects/86c567b9-e4c6-41b6-a6ec-80e7194edd3b).

## Local development

Install the locked dependencies and start the development server with Bun:

```sh
bun install --frozen-lockfile
bun run dev
```

## Deploy to Netlify

Create a static, prerendered Netlify package with:

```sh
bun install --frozen-lockfile
bun run build:netlify
```

For drag-and-drop deployment, upload the **contents of `dist-netlify/`** to Netlify. When connecting the repository instead, `netlify.toml` selects this same folder as the publish directory. The cPanel build continues to use `dist/` separately.

## Build for cPanel shared hosting

Create a static, prerendered build for Apache-based shared hosting:

```sh
bun install --frozen-lockfile
bun run build:cpanel
```

For a site installed in a subdirectory, pass its URL path as the base path. For example, to serve the site at `https://example.com/lifeos/`:

```sh
bun run build:cpanel -- --base-path=/lifeos/
```

Upload the **contents of `dist/`** to the matching document root (for the example, usually `public_html/lifeos/`). This folder contains the prerendered pages, static assets, and the included `.htaccess` rules for clean routes. Use the default build command when the site is served from the domain root.

This build does not require Node.js on the hosting account. Pages are rendered at build time and hydrated in the browser; server-only APIs or backend processing require a separate backend.

## Checks

```sh
bun run lint
bun run test
bun run build:netlify
```
