const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export function withBase(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
