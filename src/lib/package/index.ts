/**
 * @fileoverview This module exports a `radioColor` module, which is responsible
 * for generating a set of CSS color tokens based on the given options.
 */

import {generate} from 'css-tree';

/* Utils */
import {getTextColor, variants} from './utils/helpers';
import {colorToHsl} from './utils/helpers/color';
import {getImageColor} from './utils/image';

import range from './utils/range';
import tree from './utils/tree';
import token from './utils/token';

/* Type imports */
import type {
  TokenScheme,
  ColorConfiguration,
  Rule,
  TokenTheme,
  TokenNames,
} from './types';
import type {Gamut} from './utils/token/types';
import setHarmonies from './utils/harmony';

/**
 * @typedef {Object} TokenTheme
 * @property {function} TokenTheme - Returns an array of CSS declaration objects.
 * @property {Color} TokenTheme.color - The color to use for the token.
 * @property {string} TokenTheme.name - The name of the token.
 * @property {boolean} TokenTheme.font - Whether to generate a font color token.
 * @property {boolean} TokenTheme.dark - Whether to generate a dark color token.
 * @property {boolean} TokenTheme.light - Whether to generate a light color token.
 * @property {string} TokenTheme.target - The target selector for the token.
 */
const radioColor = function () {
  const tokens: TokenScheme = {
    light: [],
    dark: [],
  };

  let attributes: Rule[] = [];
  let classes: Rule[] = [];
  let styles = '';
  let target = ':root';

  /**
   * Sets the colors for the color system
   * @param {ColorConfiguration[]} configuration - An array of color options
   * @returns {void}
   */
  const setColors = (configuration: ColorConfiguration[]): void => {
    for (let c = 0; c < configuration.length; c++) {
      const {
        prefix = '',
        color,
        name,
        suffix = '',
        dark = true,
        font = true,
        selector = {attribute: true, class: true},
        theme = {
          darken: variants.dark,
          lighten: variants.light,
        },
        gamut,
        harmony,
      } = configuration[c];
      const {darken = variants.dark, lighten = variants.light} = theme;
      const hslColor = colorToHsl(color);

      if (Array.isArray(name) === true && typeof name !== 'undefined') {
        setHarmonies(name, harmony, hslColor, configuration[c], setColors);

        return;
      }

      const ranges = {
        light: range(lighten(hslColor)),
        dark: range(darken(hslColor)),
      };

      for (let i = 0; i < ranges.light.length; i++) {
        const lightSegment = ranges.light[i];
        const darkSegment = ranges.dark[i];

        const names = {
          text: `${prefix}${name}-font-${i * 10}${suffix}`,
          background: `${prefix}${name}-${i * 10}${suffix}`,
        };

        setTokens(
          {dark: dark ? darkSegment : null, light: lightSegment, font},
          names,
          gamut
        );

        if (selector.attribute) setAttributes(names, font, selector.attribute);
        if (selector.class) setClasses(names, font, selector.class);
      }
    }

    const {light, dark} = tree.tokens.scheme;

    styles = generate({
      type: 'StyleSheet',
      // TODO: Update the used tree, or clone it before using it.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      children: [
        light(tokens.light, target),
        dark(tokens.dark, target),
        ...classes,
        ...attributes,
      ],
    });
  };

  /**
   * Sets the tokens for the color system
   * @param {TokenTheme} theme - The color theme
   * @param {TokenNames} tokenNames - The names of the tokens
   * @returns {void}
   */
  const setTokens = (
    theme: TokenTheme,
    {background, text}: TokenNames,
    gamut?: Gamut
  ): void => {
    if (theme.dark) {
      const {light, dark} = token(
        background,
        {
          light: theme.light,
          dark: theme.dark,
        },
        gamut
      );

      tokens.light = [...tokens.light, ...light];
      if (dark) tokens.dark = [...tokens.dark, ...dark];
    } else {
      const {light} = token(
        background,
        {
          light: theme.light,
        },
        gamut
      );

      tokens.light = [...tokens.light, ...light];
    }

    if (theme.font) {
      if (theme.dark) {
        const {light, dark} = token(
          text,
          {
            light: getTextColor(theme.light),
            dark: getTextColor(theme.dark),
          },
          gamut
        );

        tokens.light = [...tokens.light, ...light];
        if (dark) tokens.dark = [...tokens.dark, ...dark];
      } else {
        const {light} = token(
          text,
          {
            light: getTextColor(theme.light),
          },
          gamut
        );

        tokens.light = [...tokens.light, ...light];
      }
    }
  };

  /**
   * Sets the css attributes
   * @param {TokenNames} tokenNames - The names of the tokens
   * @param {boolean} font - If the font color should be set
   * @param {boolean} selector - CSS tree selector type
   * @returns {void}
   */
  const setAttributes = (
    {background, text}: TokenNames,
    font: boolean,
    selector?: boolean
  ): void => {
    if (selector) {
      attributes.push(
        tree.selector(
          {
            type: 'Identifier',
            name: background,
          },
          'background-color',
          'AttributeSelector'
        )
      );

      if (font) {
        attributes.push(
          tree.selector(
            {
              type: 'Identifier',
              name: text,
            },
            'color',
            'AttributeSelector'
          )
        );
      }
    }
  };

  /**
   * Sets the css classes
   * @param {TokenNames} tokenNames - The names of the tokens
   * @param {boolean} font - If the font color should be set
   * @param {boolean} selector - CSS tree selector type
   * @returns {void}
   */
  const setClasses = (
    {background, text}: TokenNames,
    font: boolean,
    selector?: boolean
  ): void => {
    if (selector) {
      classes.push(
        tree.selector(background, 'background-color', 'ClassSelector')
      );

      if (font) {
        classes.push(tree.selector(text, 'color', 'ClassSelector'));
      }
    }
  };

  /**
   * Sets the default values
   */
  const setDefaults = () => {
    attributes = [];
    classes = [];
    tokens.light = [];
    tokens.dark = [];
    target = ':root';
  };

  /**
   * Returns the stylesheet
   * @returns {string} - The stylesheet
   */
  const stylesheet = (): string => {
    setDefaults();
    return styles;
  };

  /**
   * Clears the styles
   */
  const clearStyles = () => {
    styles = '';
  };

  /**
   * Sets the target for the stylesheet
   * @param {string} t - The target
   * @returns {void}
   */
  const setTarget = (t: string): void => {
    target = t;
  };

  return {
    setColors,
    setTokens,
    setTarget,
    setAttributes,
    clearStyles,
    stylesheet,
  };
};

export default radioColor;

export {getImageColor};
