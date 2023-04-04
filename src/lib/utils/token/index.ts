/**
 * @fileoverview A file for creating tokens for a CSS color scheme.
 */
import toCssTree from '../cssTree';

import type {Color} from '../range/index.type';
import type {TokenColors} from './index.type';

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
export default function cssToken(name: string, {light, dark}: TokenColors) {
  /**
   * Converts a HSL formatted color object to a CSS color string.
   * @param {Color} color - The color object.
   * @returns {string} The CSS color string.
   */
  const colorToString = ({h, s, l}: Color): string => {
    return `hsl(${h.toFixed(2)}, ${s.toFixed(2)}%, ${l.toFixed(2)}%)`;
  };

  const {token} = toCssTree;
  if (dark) {
    return {
      light: token(name, colorToString(light)),
      dark: token(name, colorToString(dark)),
    };
  }

  return {
    light: token(name, colorToString(light)),
    dark: null,
  };
}
