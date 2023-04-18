/**
 * @fileoverview A file for creating tokens for a CSS color scheme.
 */
import toCssTree from '../cssTree';
import {hslToRgb} from '../helpers';

import type {Color} from '../range/index.d';
import type {Gamut, TokenColors} from './index.d';

/**
 * Creates a token for a CSS color scheme with the given name and token colors.
 * @param {string} name - The name of the token.
 * @param {Object} colors - The token colors object, containing light and dark properties.
 * @param {Color} colors.light - The light mode color in HSL format.
 * @param {Color} colors.dark - The dark mode color in HSL format. Optional.
 * @returns {Object} The token object containing light and dark properties.
 * @returns {Object} The token object.light - The light mode token object.
 * @returns {Object} The token object.dark - The dark mode token object. Can be null if dark color is not provided.
 */
export default function cssToken(
  name: string,
  {light, dark}: TokenColors,
  gamut?: Gamut
) {
  /**
   * Converts a color object to a string.
   * @param {Color} color Hsl formatted color
   * @returns {string} Hsl formatted color as string
   */
  const hslToString = (color: Color): string => {
    const {h, s, l} = color;
    return `${h.toFixed(2)} ${s.toFixed(2)}% ${l.toFixed(2)}%`;
  };

  const toPredefinedRgbSpace = (color: Color): string => {
    const {h, s, l} = color;
    const {r, g, b} = hslToRgb(h, s, l);

    return `${r / 255}, ${g / 255}, ${b / 255}`;
  };

  const {token} = toCssTree;
  const tokenName = `${name}-token`;
  let value = `hsl(var(--${tokenName}))`;

  if (typeof gamut !== 'undefined') {
    value = `color(${gamut} --${tokenName});`;

    if (dark) {
      return {
        light: [
          token(tokenName, toPredefinedRgbSpace(light)),
          token(name, value),
        ],
        dark: [
          token(tokenName, toPredefinedRgbSpace(dark)),
          token(name, value),
        ],
      };
    }

    return {
      light: [
        token(tokenName, toPredefinedRgbSpace(light)),
        token(name, value),
      ],
      dark: null,
    };
  }

  if (dark) {
    return {
      light: [token(tokenName, hslToString(light)), token(name, value)],
      dark: [token(tokenName, hslToString(dark)), token(name, value)],
    };
  }

  return {
    light: [token(tokenName, hslToString(light)), token(name, value)],
    dark: null,
  };
}
