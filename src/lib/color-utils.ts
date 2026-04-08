function expandHex(hex: string) {
  const normalized = hex.trim().replace(/^#/, "").toLowerCase();

  if (normalized.length === 3) {
    return normalized
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
  }

  return normalized;
}

export function normalizeHexColor(
  value: string | null | undefined,
  fallback: string,
) {
  const candidate = value?.trim();

  if (!candidate) {
    return fallback.toLowerCase();
  }

  const normalized = expandHex(candidate);

  if (!/^[0-9a-f]{6}$/.test(normalized)) {
    return fallback.toLowerCase();
  }

  return `#${normalized}`;
}

export function hexToRgba(hex: string, alpha: number) {
  const normalized = expandHex(hex);

  if (!/^[0-9a-f]{6}$/.test(normalized)) {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
