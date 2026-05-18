export function encodeFavorites(ids: string[]): string {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  return unique.join(',');
}

export function decodeFavorites(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return Array.from(
    new Set(
      raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  );
}

export function filterValidIds(
  ids: string[],
  validIds: Set<string> | string[],
): string[] {
  const valid = validIds instanceof Set ? validIds : new Set(validIds);
  return ids.filter((id) => valid.has(id));
}

export function buildShareUrl(
  baseUrl: string,
  ids: string[],
  path = '/mi-dia',
): string {
  const encoded = encodeFavorites(ids);
  if (!encoded) return `${baseUrl}${path}`;
  return `${baseUrl}${path}?s=${encodeURIComponent(encoded)}`;
}

export function parseShareUrl(url: string): string[] {
  try {
    const u = new URL(url, 'http://placeholder.invalid');
    return decodeFavorites(u.searchParams.get('s'));
  } catch {
    return [];
  }
}
