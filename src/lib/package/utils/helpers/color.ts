/**
 * @fileoverview Color utilities.
 */
import type {Color, ColorInput} from '../range/types';

/**
 * Converts an HSL (hue, saturation, lightness) color value to an RGB (red, green, blue) color value.
 * @param {number} h The hue value, in degrees from 0 to 360.
 * @param {number} s The saturation value, as a percentage from 0 to 100.
 * @param {number} l The lightness value, as a percentage from 0 to 100.
 * @returns {Object} An array with three values: the red, green, and blue values (each from 0 to 255) of the corresponding RGB color.
 */
export function hslToRgb(
  h: number,
  s: number,
  l: number
): {r: number; g: number; b: number} {
  h /= 360;
  s /= 100;
  l /= 100;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Converts HSL (Hue, Saturation, Lightness) values to a hexadecimal color notation.
 * @param {number} h - The hue value in degrees, between 0 and 359.
 * @param {number} s - The saturation value as a percentage, between 0 and 100.
 * @param {number} l - The lightness value as a percentage, between 0 and 100.
 * @returns {string} The hexadecimal color notation, in the format '#RRGGBB'.
 */
export function hslToHex(h: number, s: number, l: number): string {
  // Convert the hue, saturation, and lightness values to percentages
  const hue = h % 360;
  const saturation = s / 100;
  const lightness = l / 100;

  // Calculate the RGB values from the HSL values
  const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - c / 2;

  let r = 0,
    g = 0,
    b = 0;
  if (hue >= 0 && hue < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (hue >= 60 && hue < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (hue >= 120 && hue < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (hue >= 180 && hue < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (hue >= 240 && hue < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (hue >= 300 && hue < 360) {
    r = c;
    g = 0;
    b = x;
  }

  // Convert the RGB values to hexadecimal notation
  const red = Math.round((r + m) * 255)
    .toString(16)
    .padStart(2, '0');
  const green = Math.round((g + m) * 255)
    .toString(16)
    .padStart(2, '0');
  const blue = Math.round((b + m) * 255)
    .toString(16)
    .padStart(2, '0');

  return `#${red}${green}${blue}`;
}

/**
 * Converts a hexadecimal color code to an HSL color object.
 * @param {string} hex - The hexadecimal color code to convert.
 * @returns {{h: number, s: number, l: number} | null} An object containing the
 * hue, saturation, and lightness values of the converted color, or null if the
 * input is not a valid hexadecimal color code.
 */
export function hexToHsl(
  hex: string
): {h: number; s: number; l: number} | null {
  // Ensure that the input is a valid hexadecimal color value
  if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    return null;
  }

  // Convert the hexadecimal color value to RGB values
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }

  // Convert the RGB values to HSL values
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const diff = max - min;

  let h = 0,
    s = 0,
    l = 0;
  if (diff === 0) {
    h = 0;
  } else if (max === red) {
    h = ((green - blue) / diff) % 6;
  } else if (max === green) {
    h = (blue - red) / diff + 2;
  } else {
    h = (red - green) / diff + 4;
  }

  h = Math.round(h * 60);
  if (h < 0) {
    h += 360;
  }

  l = (max + min) / 2;

  if (diff === 0) {
    s = 0;
  } else {
    s = diff / (1 - Math.abs(2 * l - 1));
  }

  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return {h, s, l};
}

/**
 * Converts hexadecimal color code to an RGB triplet.
 * @param {string} hex - The hexadecimal color code to convert.
 * @returns {[number, number, number]} An array containing the red, green, and blue values of the converted color.
 */
export function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);

  return [r, g, b];
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * @param  {number} r The red color value
 * @param  {number} g The green color value
 * @param  {number} b The blue color value
 * @return {Color}   The HSL representation
 */
export function rgbToHsl(r: number, g: number, b: number): Color {
  r /= 255;
  g /= 255;
  b /= 255;
  const l = Math.max(r, g, b);
  const s = l - Math.min(r, g, b);
  const h = s
    ? l === r
      ? (g - b) / s
      : l === g
      ? 2 + (b - r) / s
      : 4 + (r - g) / s
    : 0;

  return {
    h: 60 * h < 0 ? 60 * h + 360 : 60 * h,
    s: 100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    l: (100 * (2 * l - s)) / 2,
  };
}

/**
 * Converts ColorInput to HSL
 * @param {ColorInput} color
 * @return {Color}
 */
export function colorToHsl(color: ColorInput): Color {
  if (typeof color === 'string' && color.startsWith('rgb')) {
    const rgb = color
      .replace(/ /g, '')
      .replace('rgb', '')
      .replace('(', '')
      .replace(')', '')
      .split(',')
      .map(c => parseInt(c, 10));
    return rgbToHsl(rgb[0], rgb[1], rgb[2]);
  } else if (typeof color === 'string' && color.startsWith('#')) {
    return hexToHsl(color) || {h: 0, s: 0, l: 0};
  } else if (
    typeof color === 'object' &&
    color.h >= 0 &&
    color.s >= 0 &&
    color.l >= 0
  ) {
    return color;
  }

  return {h: 0, s: 0, l: 0};
}
