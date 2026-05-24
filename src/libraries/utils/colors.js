/**
 * Generates a consistent, pseudo-random hex color based on the inputs.
 * Uses full hue rotation at fixed high lightness so colors are visually
 * distinct while remaining light enough for black text.
 * @param {number} num - A numeric parameter
 * @param {string} str - A string parameter
 * @returns {string} A hex color code
 */

const hslToHex = (h, s, l) => {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const value = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * value).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

export function randColor(num, str) {
  const combined = `${str}-${num}`;

  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = combined.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Spread hue across the full 360° spectrum for maximum distinction.
  // Saturation 60% keeps colors rich; lightness 83% keeps black text readable.
  const hue = ((hash & 0xffff) % 360 + 360) % 360;
  return hslToHex(hue, 60, 83);
}
