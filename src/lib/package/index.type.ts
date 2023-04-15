import type {Declaration} from 'css-tree';
import type {Color, ColorInput} from './utils/range/index.d';

/**
 * @typedef {Object} ColorVariant
 * @property {function} ColorVariant - Returns an array of objects, each containing the `count`, `background`, and `foreground` properties.
 * @property {Color} ColorVariant.color - The color to use for the variant.
 */
export type ColorVariant = (color: Color) => {
  count: number;
  background: Color;
  foreground: Color;
}[];

/**
 * @typedef {Object} ColorOptions
 * @property {Color} ColorOptions.color - The base color to use for generatingthe color variants.
 * @property {string} [ColorOptions.prefix] - A prefix to use when generating token names.
 * @property {string} [ColorOptions.name='primary'] - A name to use when generating token names.
 * @property {string} [ColorOptions.suffix] - A suffix to use when generating token names.
 * @property {boolean} [ColorOptions.dark=true] - Whether to generate dark color variants.
 * @property {boolean} [ColorOptions.font=true] - Whether to generate font color variants.
 * @property {Object} [ColorOptions.selector] - An object specifying which selectors to generate.
 * @property {boolean} [ColorOptions.selector.attribute=true] - Whether to generate attribute selectors.
 * @property {boolean} [ColorOptions.selector.class=true] - Whether to generate class selectors.
 * @property {Object} [ColorOptions.theme] - An object specifying color variants to use when generating token styles.
 * @property {ColorVariant} [ColorOptions.theme.darken] - A function that returns an array of objects representing dark color variants.
 * @property {ColorVariant} [ColorOptions.theme.lighten] - A function that returns an array of objects representing light color variants.
 */
export type ColorOptions = {
  color: ColorInput;
  prefix?: string;
  name?: string;
  suffix?: string;
  dark?: boolean;
  font?: boolean;
  selector?: {
    attribute?: boolean;
    class?: boolean;
  };
  theme?: {
    darken?: ColorVariant;
    lighten?: ColorVariant;
  };
};

/**
 * @typedef {Object} TokenScheme
 * @property {Array} TokenScheme.light - An array of CSS declaration objects for the light theme.
 * @property {Array} TokenScheme.dark - An array of CSS declaration objects for the dark theme.
 */
export type TokenScheme = {
  light: Declaration[];
  dark: Declaration[];
};

/**
 * @typedef {Object} Rule
 * @property {string} Rule.type - The type of rule.
 * @property {Object} Rule.prelude - The prelude of the rule.
 * @property {Object} Rule.block - The block of the rule.
 */
export type Rule = {
  type: string;
  prelude: {
    type: string;
    children: {
      type: string;
      children: {
        type: string;
        name:
          | string
          | {
              type: string;
              name: string;
            };
        matcher: null;
        value: null;
        flags: null;
      }[];
    }[];
  };
  block: {
    type: string;
    children: {
      type: string;
      important: boolean;
      property: string;
      value: {
        type: string;
        children: {
          type: string;
          name: string;
          children: {
            type: string;
            name: string;
          }[];
        }[];
      };
    }[];
  };
};

/**
 * @typedef {Object} TokenTheme
 * @property {Color} [TokenTheme.dark=null] - The dark color to use for the token.
 * @property {Color} TokenTheme.light - The light color to use for the token.
 * @property {boolean} TokenTheme.font - Whether the token should have a font color variant.
 */
export type TokenTheme = {dark?: Color | null; light: Color; font: boolean};

/**
 * @typedef {Object} TokenNames
 * @property {string} TokenNames.text - The name of the token's text color.
 * @property {string} TokenNames.background - The name of the token's background color.
 */
export type TokenNames = {text: string; background: string};
