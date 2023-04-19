/**
 * @fileoverview A file for creating tokens for a CSS color scheme.
 */
import tree from '../tree';
import {hslToRgb} from '../helpers';

import type {Declaration} from 'css-tree';
import type {Color} from '../range/types';
import type {Gamut, TokenColors} from './types';

/**
 * Converts a color object to a string.
 * @param {Color} color Hsl formatted color
 * @returns {string} Hsl formatted color as string
 */
export function hslColorSpace(color: Color): string {
  const {h, s, l} = color;
  return `${h.toFixed(2)} ${s.toFixed(2)}% ${l.toFixed(2)}%`;
}

/**
 * Converts a color object to a predefined rgb color space.
 * @param {Color} color Hsl formatted color
 * @return {string} Rgb predefined formatted color as string
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color#formal_syntax
 */
export function rgbColorSpace(color: Color): string {
  const {h, s, l} = color;
  const {r, g, b} = hslToRgb(h, s, l);

  return `${r / 255}, ${g / 255}, ${b / 255}`;
}

/**
 * Converts a color object to a string.
 * @param {Color} color Hsl formatted color
 * @param {Gamut} gamut The color gamut to use for the color space.
 * @return {string} hsl or rgb formatted color as string
 */
export function colorSpace(color: Color, gamut?: Gamut): string {
  if (typeof gamut !== 'undefined') return rgbColorSpace(color);

  return hslColorSpace(color);
}

/**
 * Creates a token for a CSS color scheme with the given name and token colors.
 * @param {string} name - The name of the token.
 * @param {Object} colors - The token colors object, containing light and dark properties.
 * @param {Color} colors.light - The light mode color in HSL format.
 * @param {Color} colors.dark - The dark mode color in HSL format. Optional.
 * @param {Gamut} gamut - The color gamut to use for the color space.
 * @returns {Object} The token object containing light and dark properties.
 * @returns {Object} The token object.light - The light mode token object.
 * @returns {Object} The token object.dark - The dark mode token object. Can be null if dark color is not provided.
 */
export default function cssToken(
  name: string,
  {light, dark}: TokenColors,
  gamut?: Gamut
): {light: Declaration[]; dark: Declaration[] | null} {
  const {token} = tree;
  const tokenName = `${name}-token`;
  let value = `hsl(var(--${tokenName}))`;

  if (typeof gamut !== 'undefined') {
    value = `color(${gamut} var(--${tokenName}));`;
  }

  return {
    light: [token(tokenName, colorSpace(light, gamut)), token(name, value)],
    dark: dark
      ? [token(tokenName, colorSpace(dark, gamut)), token(name, value)]
      : null,
  };
}
