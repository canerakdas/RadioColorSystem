import {describe, expect, test, it} from '@jest/globals';
import range, {interpolate} from '.';

describe('range', () => {
  test('should generate an array of HSL colors based on the given parameters', () => {
    const ranges = [
      {
        count: 5,
        background: {h: 120, s: 50, l: 50},
        foreground: {h: 240, s: 50, l: 50},
        hueCurve: {
          start: 0,
          end: 360,
          points: [
            [0, 0],
            [360, 360],
          ] as [number, number][],
        },
        saturationCurve: {
          start: 0,
          end: 100,
          points: [
            [0, 0],
            [100, 100],
          ] as [number, number][],
        },
        lightnessCurve: {
          start: 0,
          end: 100,
          points: [
            [0, 0],
            [100, 100],
          ] as [number, number][],
        },
      },
    ];

    const expectedColors = [
      {h: 120, l: 50, s: 50},
      {h: 144, l: 50, s: 50},
      {h: 168, l: 50, s: 50},
      {h: 192, l: 50, s: 50},
      {h: 216, l: 50, s: 50},
      {h: 240, l: 50, s: 50},
    ];

    const colors = range(ranges);

    expect(colors).toEqual(expectedColors);
  });
});

describe('interpolate', () => {
  it('should return start value if value is less than or equal to x1', () => {
    const params = {
      start: 10,
      end: 100,
      points: [
        [0, 0],
        [10, 50],
        [20, 100],
      ] as [number, number][],
    };
    const value = -1;
    expect(interpolate(params, value)).toBe(10);
  });

  it('should return end value if value is greater than or equal to x2', () => {
    const params = {
      start: 10,
      end: 100,
      points: [
        [0, 0],
        [10, 50],
        [20, 100],
      ] as [number, number][],
    };
    const value = 30;
    expect(interpolate(params, value)).toBe(100);
  });

  it('should interpolate a value within the given range', () => {
    const params = {
      start: 10,
      end: 100,
      points: [
        [0, 0],
        [10, 50],
        [20, 100],
      ] as [number, number][],
    };
    const value = 5;
    expect(interpolate(params, value)).toBe(56.25);
  });

  it('should interpolate a value with arbitrary points', () => {
    const params = {
      start: 0,
      end: 100,
      points: [
        [0, 0],
        [10, 50],
        [15, 70],
        [20, 100],
      ] as [number, number][],
    };
    const value = 12;
    expect(interpolate(params, value)).toBe(35.68);
  });

  it('should interpolate a value with only two points', () => {
    const params = {
      start: 0,
      end: 100,
      points: [
        [0, 0],
        [20, 100],
      ] as [number, number][],
    };
    const value = 10;
    expect(interpolate(params, value)).toBe(50);
  });
});
