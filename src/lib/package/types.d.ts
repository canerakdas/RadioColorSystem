import type {Declaration} from 'css-tree';
import type {Color, ColorInput} from './utils/range/types';
import type {Gamut} from './utils/token/types';

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
 * @typedef {Object} ColorConfiguration
 * @property {Color} ColorConfiguration.color - The base color to use for generatingthe color variants.
 * @property {string} [ColorConfiguration.prefix] - A prefix to use when generating token names.
 * @property {string} [ColorConfiguration.name='primary'] - A name to use when generating token names.
 * @property {string} [ColorConfiguration.suffix] - A suffix to use when generating token names.
 * @property {boolean} [ColorConfiguration.dark=true] - Whether to generate dark color variants.
 * @property {boolean} [ColorConfiguration.font=true] - Whether to generate font color variants.
 * @property {Object} [ColorConfiguration.selector] - An object specifying which selectors to generate.
 * @property {boolean} [ColorConfiguration.selector.attribute=true] - Whether to generate attribute selectors.
 * @property {boolean} [ColorConfiguration.selector.class=true] - Whether to generate class selectors.
 * @property {Object} [ColorConfiguration.theme] - An object specifying color variants to use when generating token styles.
 * @property {ColorVariant} [ColorConfiguration.theme.darken] - A function that returns an array of objects representing dark color variants.
 * @property {ColorVariant} [ColorConfiguration.theme.lighten] - A function that returns an array of objects representing light color variants.
 */
export type ColorConfiguration = {
  color: ColorInput;
  prefix?: string;
  name?: string | string[];
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
  gamut?: Gamut;
  harmony?:
    | 'triadic'
    | 'complementary'
    | 'splitComplementary'
    | 'tetradic'
    | 'square'
    | 'analogous';
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
