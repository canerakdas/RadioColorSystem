import {describe, expect, test} from '@jest/globals';
import cssToken, {colorSpace, hslColorSpace, rgbColorSpace} from '.';

describe('hslColorSpace', () => {
  test('converts a color object to a HSL formatted string', () => {
    const color = {h: 210, s: 0.5, l: 0.7};
    const expected = '210.00 0.50% 0.70%';
    const result = hslColorSpace(color);
    expect(result).toEqual(expected);
  });
});

describe('rgbColorSpace', () => {
  test('converts a color object to a predefined RGB formatted string', () => {
    const color = {h: 200, s: 0.5, l: 0.7};
    const expected =
      '0.00784313725490196, 0.00784313725490196, 0.00784313725490196';
    const result = rgbColorSpace(color);
    expect(result).toEqual(expected);
  });
});

describe('colorSpace', () => {
  test('converts a color object to an HSL formatted string when no gamut is specified', () => {
    const color = {h: 120, s: 0.6, l: 0.5};
    const expected = '120.00 0.60% 0.50%';
    const result = colorSpace(color);
    expect(result).toEqual(expected);
  });

  test('converts a color object to a predefined RGB formatted string when a gamut is specified', () => {
    const color = {h: 300, s: 0.8, l: 0.4};
    const gamut = 'srgb';
    const expected =
      '0.00392156862745098, 0.00392156862745098, 0.00392156862745098';
    const result = colorSpace(color, gamut);
    expect(result).toEqual(expected);
  });
});

describe('cssToken', () => {
  const lightColor = {h: 120, s: 0.6, l: 0.5};
  const darkColor = {h: 240, s: 0.8, l: 0.2};
  const gamut = 'p3';

  test('creates a token object with light and dark properties when dark color is provided', () => {
    const expectedLightColor = {
      type: 'Raw',
      value: '0.00392156862745098, 0.00392156862745098, 0.00392156862745098',
    };
    const expectedDarkColor = {
      type: 'Raw',
      value: '0.00392156862745098, 0.00392156862745098, 0.00392156862745098',
    };

    const token = cssToken(
      'test-token',
      {light: lightColor, dark: darkColor},
      gamut
    );

    expect(token.light.length).toEqual(2);
    if (token.dark === null) throw new Error('dark is null');
    expect(token.dark.length).toEqual(2);

    expect(token.light[0].value).toEqual(expectedLightColor);

    expect(token.light[1].value).toEqual({
      type: 'Raw',
      value: 'color(p3 var(--test-token-token));',
    });

    expect(token.dark[0].value).toEqual(expectedDarkColor);

    expect(token.dark[1].value).toEqual({
      type: 'Raw',
      value: 'color(p3 var(--test-token-token));',
    });
  });

  test('creates a token object with only light properties when dark color is not provided', () => {
    const expectedLightColor = {
      type: 'Raw',
      value: '0.00392156862745098, 0.00392156862745098, 0.00392156862745098',
    };

    const token = cssToken('test-token', {light: lightColor}, gamut);

    expect(token.light.length).toEqual(2);
    expect(token.dark).toBeNull();

    expect(token.light[0].value).toEqual(expectedLightColor);

    expect(token.light[1].value).toEqual({
      type: 'Raw',
      value: 'color(p3 var(--test-token-token));',
    });
  });
});
