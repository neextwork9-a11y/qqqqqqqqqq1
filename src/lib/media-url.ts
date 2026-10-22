const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export function withBasePath(url: string): string {
  if (
    !url.startsWith("/") ||
    url.startsWith("//") ||
    !basePath ||
    url === basePath ||
    url.startsWith(`${basePath}/`)
  ) {
    return url;
  }

  return `${basePath}${url}`;
}

export function withBasePathInStyle(style: string): string {
  return style.replace(
    /url\(\s*(["']?)(\/(?!\/)[^)'" ]+)\1\s*\)/g,
    (_match, quote: string, url: string) =>
      `url(${quote}${withBasePath(url)}${quote})`,
  );
}
