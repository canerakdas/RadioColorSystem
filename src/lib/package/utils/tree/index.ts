/**
 * @fileoverview A utility for converting values into the CSS tree format.
 * @see https://github.com/csstree/csstree
 * @see https://github.com/csstree/csstree/blob/master/docs/ast.md
 */

import type {Declaration, PseudoClassSelector} from 'css-tree';

import {SelectorType} from './index.d';

/**
 * Returns the type of CSS selector based on the provided target string.
 * @param {string} target The target string to check.
 * @returns {string} The type of CSS selector.
 */
export function getSelectorType(target: string): SelectorType {
  switch (target[0]) {
    case ':':
      return SelectorType.PseudoClassSelector;
    case '#':
      return SelectorType.IdSelector;
    case '.':
      return SelectorType.ClassSelector;
    case '[':
      return SelectorType.AttributeSelector;
    default:
      return SelectorType.PseudoClassSelector;
  }
}

/**
 * Normalizes the provided CSS selector by removing any prefix that indicates the type of selector.
 * @param {string} target The CSS selector to normalize.
 * @returns {string} The normalized CSS selector.
 */
export function normalizeSelector(target: string): string {
  switch (target[0]) {
    case ':':
    case '#':
    case '.':
      return target.slice(1);
    case '[':
      return target.slice(1, -1);
    default:
      return target;
  }
}

const tree = {
  /**
   * Creates a CSS declaration token.
   * @param {string} token - The name of the CSS property.
   * @param {string} value - The value of the CSS property.
   * @returns {Declaration} - A CSS declaration token.
   */
  token: (token: string, value: string): Declaration => {
    return {
      type: 'Declaration',
      important: false,
      property: `--${token}`,
      value: {
        type: 'Raw',
        value,
      },
    } as Declaration;
  },
  tokens: {
    scheme: {
      /**
       * Converts the provided tokens and target string to a CSS tree node for the light theme.
       * @param {Declaration[]} tokens The CSS tokens to include in the node.
       * @param {string} target The target selector for the node.
       * @returns {Object} The CSS tree node for the light theme.
       */
      light: (tokens: Declaration[], target: string) => ({
        type: 'Rule',
        prelude: {
          type: 'SelectorList',
          children: [
            {
              type: 'Selector',
              children: [
                {
                  type: getSelectorType(target),
                  name: normalizeSelector(target),
                  children: null,
                },
              ] as PseudoClassSelector[],
            },
          ],
        },
        block: {
          type: 'Block',
          children: tokens,
        },
      }),
      /**
       * Converts the provided tokens and target string to a CSS tree node for the dark theme.
       * @param {Declaration[]} tokens The CSS tokens to include in the node.
       * @param {string} target The target selector for the node.
       * @returns {Object} The CSS tree node for the dark theme.
       */
      dark: (tokens: Declaration[], target: string) => ({
        type: 'Atrule',
        name: 'media',
        prelude: {
          type: 'AtrulePrelude',
          children: [
            {
              type: 'MediaQueryList',
              children: [
                {
                  type: 'MediaQuery',
                  children: [
                    {
                      type: 'MediaFeature',
                      name: 'prefers-color-scheme',
                      value: {
                        type: 'Identifier',
                        name: 'dark',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        block: {
          type: 'Block',
          children: [
            {
              type: 'Rule',
              prelude: {
                type: 'SelectorList',
                children: [
                  {
                    type: 'Selector',
                    children: [
                      {
                        type: getSelectorType(target),
                        name: normalizeSelector(target),
                        children: null,
                      },
                    ],
                  },
                ],
              },
              block: {
                type: 'Block',
                children: tokens,
              },
            },
          ],
        },
      }),
    },
  },

  /**
   * A function that takes a selector name, property, and selector type and returns a CSS tree object
   * representing the rule.
   * @param {string|{ type: string; name: string }} name - The name of the selector or an object containing
   *   the type and name of the selector.
   * @param {string} property - The property of the rule.
   * @param {string} selectorType - The type of the selector.
   * @returns {Object} A CSS tree object representing the rule.
   */
  selector: (
    name: string | {type: string; name: string},
    property: string,
    selectorType: string
  ) => {
    return {
      type: 'Rule',
      prelude: {
        type: 'SelectorList',
        children: [
          {
            type: 'Selector',
            children: [
              {
                type: selectorType,
                name: name,
                matcher: null,
                value: null,
                flags: null,
              },
            ],
          },
        ],
      },
      block: {
        type: 'Block',
        children: [
          {
            type: 'Declaration',
            important: false,
            property: property,
            value: {
              type: 'Value',
              children: [
                typeof name === 'string'
                  ? {
                      type: 'Function',
                      name: 'var',
                      children: [
                        {
                          type: 'Identifier',
                          name: `--${name}`,
                        },
                      ],
                    }
                  : {
                      type: 'Function',
                      name: 'var',
                      children: [
                        {
                          type: 'Identifier',
                          name: `--${name.name}`,
                        },
                      ],
                    },
              ],
            },
          },
        ],
      },
    };
  },
};

export default tree;
