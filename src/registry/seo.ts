/** Shared by page metadata and the sitemap so their indexing policy agrees. */
export function isIndexablePath(path: string): boolean {
  const pathname = path.split(/[?#]/u, 1)[0].replace(/\/+$/u, "") || "/";
  return !["/settings", "/notes", "/recycle", "/terminal", "/github"].some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export const seoBrandName = "WestCose Labs";
export const homeTitle = "Website Design & Web Development";
