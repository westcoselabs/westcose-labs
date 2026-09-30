/** Canonicals must use an HTTPS origin, never a preview path or local address. */
export function parseSiteOrigin(value: string | undefined): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    if (
      url.protocol !== "https:" || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash ||
      host === "localhost" || host.endsWith(".localhost") ||
      host === "[::1]" || host === "0.0.0.0" || host.startsWith("127.")
    ) return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}
