/**
 * @fileoverview A collection of helper functions.
 */
import type {Color} from '../range/types';
import {hexToRgb, hslToHex} from './color';

/**
 * A helper object for generating color variants.
 * @typedef {Object} VariantHelper
 * @property {(color: Color) => Object[]} dark - Generates a dark color variant.
 * @property {(color: Color) => Object[]} light - Generates a light color variant.
 */

/**
 * Generates color variants for dark and light themes.
 * @type {VariantHelper}
 */
export const variants = {
  /**
   * Generates a dark color variant.
   * @param {Color} color - The base color.
   * @returns {Object[]} An array of objects representing the color variant.
   */
  dark: (color: Color) => {
    return [
      {
        count: 5,
        background: {h: color.h, s: color.s, l: 30 + color.l * 0.2},
        foreground: {h: color.h, s: color.s, l: 15 + color.l * 0.1},
      },
      {
        count: 5,
        background: {h: color.h, s: color.s, l: 15 + color.l * 0.1},
        foreground: {h: color.h, s: color.s, l: 2},
      },
    ];
  },

  /**
   * Generates a light color variant.
   * @param {Color} color - The base color.
   * @returns {Object} An array of objects representing the color variant.
   */
  light: (color: Color) => {
    return [
      {
        count: 5,
        background: {
          h: color.h,
          s: Math.min(0, color.s - 24),
          l: 0,
        },
        foreground: color,
      },
      {
        count: 5,
        background: color,
        foreground: {
          h: color.h,
          s: color.s,
          l: 100,
        },
      },
    ];
  },
};

/**
 * Calculates the contrast ratio between two colors.
 * @param {string} color1 - The hexadecimal color code.
 * @param {string} color2 - The hexadecimal color code.
 * @returns {number} The relative luminance of the color.
 * @see https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  // Convert the colors to their RGB values
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  // Calculate the relative luminance of each color
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  // Calculate the contrast ratio
  const contrastRatio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return contrastRatio;
}

/**
 * Returns the relative luminance of a color.
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 * @param {number[]} rgb - The RGB color values.
 * @returns {number} - The relative luminance of the color.
 */
export function getRelativeLuminance(rgb: [number, number, number]): number {
  // Convert the RGB values to sRGB
  const [r, g, b] = rgb.map(val => {
    const srgbVal = val / 255;
    return srgbVal <= 0.03928
      ? srgbVal / 12.92
      : Math.pow((srgbVal + 0.055) / 1.055, 2.4);
  });

  // Calculate the relative luminance using the sRGB values
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Returns an HSL color with adjusted lightness for better text visibility.
 * @see https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 * @param {Color} color - The input HSL color.
 * @returns {Color} - An HSL color with adjusted lightness.
 */
export function getTextColor(color: Color): Color {
  const contrastRatio = {
    '4.5': [] as number[],
    '7.5': [] as number[],
  };

  const findClosest = (arr: number[], value: number) => {
    return arr.reduce((previous, current) => {
      return Math.abs(current - value) < Math.abs(previous - value)
        ? current
        : previous;
    });
  };

  for (let light = 0; light < 100; light++) {
    const ratio = calculateContrastRatio(
      hslToHex(color.h, color.s, color.l),
      hslToHex(color.h, color.s, light)
    );

    if (ratio > 4.5) {
      contrastRatio['4.5'].push(light);
    }

    if (ratio > 7.5) {
      contrastRatio['7.5'].push(light);
    }
  }

  if (contrastRatio['7.5'].length > 0) {
    return {
      h: color.h,
      s: color.s,
      l: findClosest(contrastRatio['7.5'], color.l),
    };
  }

  return {
    h: color.h,
    s: color.s,
    l: findClosest(contrastRatio['4.5'], color.l),
  };
}
