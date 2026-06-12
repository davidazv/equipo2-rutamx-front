function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = Math.trunc((hash << 5) - hash + str.codePointAt(i)!);
  }
  return Math.abs(hash);
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    Number.parseInt(h.substring(0, 2), 16),
    Number.parseInt(h.substring(2, 4), 16),
    Number.parseInt(h.substring(4, 6), 16),
  ];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (c: number) =>
    Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Deterministically vary a hex color's hue and lightness based on a route ID */
export function varyColor(hex: string, routeId: string): string {
  const seed = hashString(routeId);
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);

  const hueShift = ((seed % 100) / 100) * 0.16 - 0.08;
  const lightShift = ((seed % 47) / 47) * 0.24 - 0.12;
  const satBoost = s < 0.2 ? 0.25 + ((seed % 29) / 29) * 0.15 : 0;

  const newH = ((h + hueShift) % 1 + 1) % 1;
  const newS = Math.min(1, s + satBoost);
  const newL = Math.max(0.2, Math.min(0.8, l + lightShift));

  return hslToHex(newH, newS, newL);
}

/**
 * Convert sRGB channel (0-255) to linear light for luminance calculation.
 */
function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/**
 * WCAG relative luminance (0 = black, 1 = white).
 * Accounts for human perception — yellows/greens register as brighter
 * than HSL lightness suggests.
 */
function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/**
 * Ensure a hex color has enough perceived contrast against a white background.
 * Uses WCAG relative luminance instead of HSL lightness so bright yellows
 * and greens (e.g. #E5FF2F) are properly darkened.
 * Default minRatio of 3 targets WCAG AA for UI components.
 */
export function ensureContrast(hex: string, minRatio = 3): string {
  const [r, g, b] = hexToRgb(hex);
  const lum = relativeLuminance(r, g, b);
  const ratio = (1.05) / (lum + 0.05); // contrast against white (luminance 1.0)
  if (ratio >= minRatio) return hex;

  // Darken via HSL until we meet the target contrast ratio
  const [h, s, l] = rgbToHsl(r, g, b);
  let lo = 0, hi = l;
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    const test = hslToHex(h, s, mid);
    const [tr, tg, tb] = hexToRgb(test);
    const testRatio = 1.05 / (relativeLuminance(tr, tg, tb) + 0.05);
    if (testRatio >= minRatio) lo = mid;
    else hi = mid;
  }
  return hslToHex(h, s, lo);
}

/** Blend a hex color towards white by a factor (0 = original, 1 = white) */
export function blendWithWhite(hex: string, factor: number): string {
  const [r, g, b] = hexToRgb(hex);
  const blend = (c: number) => Math.round(c + (255 - c) * factor);
  const toHex = (c: number) => c.toString(16).padStart(2, "0");
  return `#${toHex(blend(r))}${toHex(blend(g))}${toHex(blend(b))}`;
}
