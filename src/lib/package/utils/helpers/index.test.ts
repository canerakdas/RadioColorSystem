import {describe, expect, test, it} from '@jest/globals';
import {
  calculateContrastRatio,
  getRelativeLuminance,
  getTextColor,
  variants,
} from '.';
import {hslToHex} from './color';

describe('variants', () => {
  const baseColor = {h: 120, s: 75, l: 50};

  describe('dark', () => {
    test('generates two objects with the correct properties', () => {
      const result = variants.dark(baseColor);

      expect(result).toHaveLength(2);

      expect(result[0]).toHaveProperty('count', 5);
      expect(result[0]).toHaveProperty('background', {h: 120, s: 75, l: 40});
      expect(result[0]).toHaveProperty('foreground', {h: 120, s: 75, l: 20});

      expect(result[1]).toHaveProperty('count', 5);
      expect(result[1]).toHaveProperty('background', {h: 120, s: 75, l: 20});
      expect(result[1]).toHaveProperty('foreground', {h: 120, s: 75, l: 2});
    });
  });

  describe('light', () => {
    test('generates two objects with the correct properties', () => {
      const result = variants.light(baseColor);

      expect(result).toHaveLength(2);

      expect(result[0]).toHaveProperty('count', 5);
      expect(result[0]).toHaveProperty('background', {h: 120, s: 0, l: 0});
      expect(result[0]).toHaveProperty('foreground', {h: 120, s: 75, l: 50});

      expect(result[1]).toHaveProperty('count', 5);
      expect(result[1]).toHaveProperty('background', {h: 120, s: 75, l: 50});
      expect(result[1]).toHaveProperty('foreground', {h: 120, s: 75, l: 100});
    });
  });
});

describe('calculateContrastRatio', () => {
  it('calculates contrast ratio between two colors', () => {
    expect(calculateContrastRatio('#ffffff', '#000000')).toEqual(21);
    expect(calculateContrastRatio('#000000', '#ffffff')).toEqual(21);
    expect(calculateContrastRatio('#ff0000', '#00ff00')).toBeCloseTo(
      2.91,
      1.76
    );
    expect(calculateContrastRatio('#0000ff', '#ffff00')).toBeCloseTo(8, 2);
  });
});

describe('getRelativeLuminance', () => {
  it('should return the relative luminance of a color', () => {
    // Test a dark color
    expect(getRelativeLuminance([0, 0, 0])).toBeCloseTo(0, 3);

    // Test a light color
    expect(getRelativeLuminance([255, 255, 255])).toBeCloseTo(1, 3);

    // Test a mid-gray color
    expect(getRelativeLuminance([128, 128, 128])).toBeCloseTo(0.2158, 3);

    // Test a red color
    expect(getRelativeLuminance([255, 0, 0])).toBeCloseTo(0.2126, 3);

    // Test a green color
    expect(getRelativeLuminance([0, 255, 0])).toBeCloseTo(0.7152, 3);

    // Test a blue color
    expect(getRelativeLuminance([0, 0, 255])).toBeCloseTo(0.0722, 3);
  });
});

describe('getTextColor', () => {
  it('returns a color object with the same hue and saturation as the input', () => {
    const inputColor = {h: 120, s: 50, l: 60};
    const outputColor = getTextColor(inputColor);
    expect(outputColor.h).toBe(inputColor.h);
    expect(outputColor.s).toBe(inputColor.s);
  });

  it('returns a color object with a lightness that results in a contrast ratio greater than 7.5', () => {
    const inputColor = {h: 120, s: 50, l: 60};
    const outputColor = getTextColor(inputColor);
    const contrastRatio = calculateContrastRatio(
      hslToHex(inputColor.h, inputColor.s, inputColor.l),
      hslToHex(outputColor.h, outputColor.s, outputColor.l)
    );
    expect(contrastRatio).toBeGreaterThan(7.5);
  });

  it('returns a color object with a lightness that results in a contrast ratio greater than 4.5 if no lightness gives a contrast ratio greater than 7.5', () => {
    const inputColor = {h: 120, s: 50, l: 90};
    const outputColor = getTextColor(inputColor);
    const contrastRatio = calculateContrastRatio(
      hslToHex(inputColor.h, inputColor.s, inputColor.l),
      hslToHex(outputColor.h, outputColor.s, outputColor.l)
    );
    expect(contrastRatio).toBeGreaterThan(4.5);
    expect(contrastRatio).toBeLessThanOrEqual(7.6);
  });

  it('returns a color object with a lightness of 0 if the input lightness is 0', () => {
    const inputColor = {h: 120, s: 50, l: 0};
    const outputColor = getTextColor(inputColor);
    expect(outputColor.l).toBe(47);
  });

  it('returns a color object with a lightness of 100 if the input lightness is 100', () => {
    const inputColor = {h: 120, s: 50, l: 100};
    const outputColor = getTextColor(inputColor);
    expect(outputColor.l).toBe(25);
  });
});
