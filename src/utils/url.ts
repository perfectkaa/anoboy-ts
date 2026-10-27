export function ensureAbsoluteUrl(base: string, url: string): string {
  try {
    return new URL(url, base).href;
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }
}

export function isAllowedDomain(url: string, allowed = ['anoboy.quest']): boolean {
  try {
    const { hostname } = new URL(url);
    return allowed.some((d) => hostname.endsWith(d));
  } catch {
    return false;
  }
}
