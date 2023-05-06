import {describe, expect, it} from '@jest/globals';
import tree, {getSelectorType, normalizeSelector} from '.';
import {SelectorType} from './enums';

describe('getSelectorType', () => {
  it('returns SelectorType.PseudoClassSelector for a pseudo-class selector', () => {
    expect(getSelectorType(':hover')).toEqual(SelectorType.PseudoClassSelector);
  });

  it('returns SelectorType.IdSelector for an ID selector', () => {
    expect(getSelectorType('#my-id')).toEqual(SelectorType.IdSelector);
  });

  it('returns SelectorType.ClassSelector for a class selector', () => {
    expect(getSelectorType('.my-class')).toEqual(SelectorType.ClassSelector);
  });

  it('returns SelectorType.AttributeSelector for an attribute selector', () => {
    expect(getSelectorType('[data-foo]')).toEqual(
      SelectorType.AttributeSelector
    );
  });

  it('returns SelectorType.PseudoClassSelector for an unknown selector type', () => {
    expect(getSelectorType('my-selector')).toEqual(
      SelectorType.PseudoClassSelector
    );
  });
});

describe('normalizeSelector', () => {
  it('removes the colon from a pseudo-class selector', () => {
    expect(normalizeSelector(':hover')).toEqual('hover');
  });

  it('removes the pound sign from an ID selector', () => {
    expect(normalizeSelector('#my-id')).toEqual('my-id');
  });

  it('removes the period from a class selector', () => {
    expect(normalizeSelector('.my-class')).toEqual('my-class');
  });

  it('removes the square brackets from an attribute selector', () => {
    expect(normalizeSelector('[data-foo]')).toEqual('data-foo');
  });

  it('returns the original selector if it does not have a recognized prefix', () => {
    expect(normalizeSelector('my-selector')).toEqual('my-selector');
  });
});

describe('tree methods', () => {
  describe('token', () => {
    it('creates a CSS declaration token', () => {
      const token = tree.token('color', 'red');
      expect(token).toEqual({
        type: 'Declaration',
        important: false,
        property: '--color',
        value: {
          type: 'Raw',
          value: 'red',
        },
      });
    });
  });

  describe('tokens', () => {
    describe('scheme.light', () => {
      it('converts the provided tokens and target string to a CSS tree node for the light theme', () => {
        const tokens = [
          tree.token('color', 'red'),
          tree.token('font-size', '16px'),
        ];
        const target = 'body';
        const node = tree.tokens.scheme.light(tokens, target);
        expect(node).toEqual({
          type: 'Rule',
          prelude: {
            type: 'SelectorList',
            children: [
              {
                type: 'Selector',
                children: [
                  {
                    type: 'PseudoClassSelector',
                    name: 'body',
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
        });
      });
    });

    describe('scheme.dark', () => {
      it('converts the provided tokens and target string to a CSS tree node for the dark theme', () => {
        const tokens = [
          tree.token('color', 'white'),
          tree.token('background-color', 'black'),
        ];
        const target = 'body';
        const node = tree.tokens.scheme.dark(tokens, target);
        expect(node).toEqual({
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
                          type: 'PseudoClassSelector',
                          name: 'body',
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
        });
      });
    });
  });

  describe('tree.selector', () => {
    it('creates a CSS tree object with a string selector', () => {
      const name = 'my-selector';
      const property = 'background-color';
      const selectorType = 'ClassSelector';
      const expected = {
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
                  {
                    type: 'Function',
                    name: 'var',
                    children: [
                      {
                        type: 'Identifier',
                        name: `--${name}`,
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      };
      expect(tree.selector(name, property, selectorType)).toEqual(expected);
    });

    it('creates a CSS tree object with an object selector', () => {
      const name = {type: 'IdSelector', name: 'my-id'};
      const property = 'color';
      const selectorType = 'TypeSelector';
      const expected = {
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
                  {
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
      expect(tree.selector(name, property, selectorType)).toEqual(expected);
    });
  });
});
