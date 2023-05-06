import {
  colorToHsl,
  hexToHsl,
  hexToRgb,
  hslToHex,
  hslToRgb,
  rgbToHsl,
} from './color';
import {describe, expect, test} from '@jest/globals';

describe('hslToRgb', () => {
  test('converts black correctly', () => {
    const result = hslToRgb(0, 0, 0);
    expect(result).toEqual({r: 0, g: 0, b: 0});
  });

  test('converts white correctly', () => {
    const result = hslToRgb(0, 0, 100);
    expect(result).toEqual({r: 255, g: 255, b: 255});
  });

  test('converts red correctly', () => {
    const result = hslToRgb(0, 100, 50);
    expect(result).toEqual({r: 255, g: 0, b: 0});
  });

  test('converts yellow correctly', () => {
    const result = hslToRgb(60, 100, 50);
    expect(result).toEqual({r: 255, g: 255, b: 0});
  });

  test('converts green correctly', () => {
    const result = hslToRgb(120, 100, 50);
    expect(result).toEqual({r: 0, g: 255, b: 0});
  });

  test('converts cyan correctly', () => {
    const result = hslToRgb(180, 100, 50);
    expect(result).toEqual({r: 0, g: 255, b: 255});
  });

  test('converts blue correctly', () => {
    const result = hslToRgb(240, 100, 50);
    expect(result).toEqual({r: 0, g: 0, b: 255});
  });

  test('converts magenta correctly', () => {
    const result = hslToRgb(300, 100, 50);
    expect(result).toEqual({r: 255, g: 0, b: 255});
  });
});

describe('hslToHex', () => {
  test('returns the correct hexadecimal color notation for red', () => {
    expect(hslToHex(0, 100, 50)).toBe('#ff0000');
  });

  test('returns the correct hexadecimal color notation for green', () => {
    expect(hslToHex(120, 100, 50)).toBe('#00ff00');
  });

  test('returns the correct hexadecimal color notation for blue', () => {
    expect(hslToHex(240, 100, 50)).toBe('#0000ff');
  });

  test('returns the correct hexadecimal color notation for white', () => {
    expect(hslToHex(0, 0, 100)).toBe('#ffffff');
  });

  test('returns the correct hexadecimal color notation for black', () => {
    expect(hslToHex(0, 0, 0)).toBe('#000000');
  });

  test('returns the correct hexadecimal color notation for a random color', () => {
    expect(hslToHex(198, 46, 77)).toBe('#a9cfdf');
  });
});

describe('hexToHsl', () => {
  test('converts "#000000" to { h: 0, s: 0, l: 0 }', () => {
    expect(hexToHsl('#000000')).toEqual({h: 0, s: 0, l: 0});
  });

  test('converts "#FFFFFF" to { h: 0, s: 0, l: 100 }', () => {
    expect(hexToHsl('#FFFFFF')).toEqual({h: 0, s: 0, l: 100});
  });

  test('converts "#FF0000" to { h: 0, s: 100, l: 50 }', () => {
    expect(hexToHsl('#FF0000')).toEqual({h: 0, s: 100, l: 50});
  });

  test('converts "#00FF00" to { h: 120, s: 100, l: 50 }', () => {
    expect(hexToHsl('#00FF00')).toEqual({h: 120, s: 100, l: 50});
  });

  test('converts "#0000FF" to { h: 240, s: 100, l: 50 }', () => {
    expect(hexToHsl('#0000FF')).toEqual({h: 240, s: 100, l: 50});
  });

  test('returns null for invalid input', () => {
    expect(hexToHsl('#GGGGGG')).toBeNull();
  });
});

describe('hexToRgb', () => {
  test('should convert #000000 to [0, 0, 0]', () => {
    expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
  });

  test('should convert #FFFFFF to [255, 255, 255]', () => {
    expect(hexToRgb('#FFFFFF')).toEqual([255, 255, 255]);
  });

  test('should convert #FF0000 to [255, 0, 0]', () => {
    expect(hexToRgb('#FF0000')).toEqual([255, 0, 0]);
  });

  test('should convert #00FF00 to [0, 255, 0]', () => {
    expect(hexToRgb('#00FF00')).toEqual([0, 255, 0]);
  });

  test('should convert #0000FF to [0, 0, 255]', () => {
    expect(hexToRgb('#0000FF')).toEqual([0, 0, 255]);
  });

  test('should convert #C0C0C0 to [192, 192, 192]', () => {
    expect(hexToRgb('#C0C0C0')).toEqual([192, 192, 192]);
  });

  test('should convert #123456 to [18, 52, 86]', () => {
    expect(hexToRgb('#123456')).toEqual([18, 52, 86]);
  });

  test('should convert #abcdef to [171, 205, 239]', () => {
    expect(hexToRgb('#abcdef')).toEqual([171, 205, 239]);
  });
});

describe('rgbToHsl', () => {
  test('should convert (255, 0, 0) to (0, 100, 50)', () => {
    const color = rgbToHsl(255, 0, 0);
    expect(color.h).toBe(0);
    expect(color.s).toBe(100);
    expect(color.l).toBe(50);
  });

  test('should convert (0, 255, 0) to (120, 100, 50)', () => {
    const color = rgbToHsl(0, 255, 0);
    expect(color.h).toBe(120);
    expect(color.s).toBe(100);
    expect(color.l).toBe(50);
  });

  test('should convert (0, 0, 255) to (240, 100, 50)', () => {
    const color = rgbToHsl(0, 0, 255);
    expect(color.h).toBe(240);
    expect(color.s).toBe(100);
    expect(color.l).toBe(50);
  });

  test('should convert (128, 128, 128) to (0, 0, 50)', () => {
    const color = rgbToHsl(128, 128, 128);
    expect(color.h).toBe(0);
    expect(color.s).toBe(0);
    expect(color.l).toBe(50.19607843137255);
  });

  test('should convert (255, 255, 255) to (0, 0, 100)', () => {
    const color = rgbToHsl(255, 255, 255);
    expect(color.h).toBe(0);
    expect(color.s).toBe(0);
    expect(color.l).toBe(100);
  });

  test('should convert (0, 0, 0) to (0, 0, 0)', () => {
    const color = rgbToHsl(0, 0, 0);
    expect(color.h).toBe(0);
    expect(color.s).toBe(0);
    expect(color.l).toBe(0);
  });
});

describe('colorToHsl', () => {
  test('converts RGB string to HSL', () => {
    expect(colorToHsl('rgb(255, 0, 0)')).toEqual({h: 0, s: 100, l: 50});
  });

  test('converts hexadecimal string to HSL', () => {
    expect(colorToHsl('#ff0000')).toEqual({h: 0, s: 100, l: 50});
  });

  test('returns input Color object', () => {
    expect(colorToHsl({h: 120, s: 60, l: 70})).toEqual({
      h: 120,
      s: 60,
      l: 70,
    });
  });

  test('returns default Color object when invalid input is provided', () => {
    expect(colorToHsl('#invalid-color')).toEqual({h: 0, s: 0, l: 0});
  });
});
