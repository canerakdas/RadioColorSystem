/**
 * @fileoverview This file contains the implementation of a color range generator
 * that can be used to generate a range of HSL colors with interpolated hue,
 * saturation and lightness values.
 *
 * The main function exported by this module is `colorRange`, which takes
 * an array of `Range` objects as input and returns an array of HSLColor objects as
 * output.
 */
import type {Color, CurveParams, Range} from './index.type';

/**
 * Generate an array of HSL colors with interpolated values based on the given parameters
 * @param {Array<Range>} ranges - An array of objects representing the color ranges to generate
 * @returns {Array<Color>} An array of HSL colors
 */
export default function colorRange(ranges: Range[]): Color[] {
  /**
   * Interpolate a value using the given curve parameters
   * @param {CurveParams} params - The curve parameters to use
   * @param {number} value - The value to interpolate
   * @returns {number} The interpolated value
   */
  const interpolateValue = (params: CurveParams, value: number): number => {
    const [x1, y1] = params.points[0];
    const [x2, y2] = params.points[params.points.length - 1];
    if (value <= x1) {
      return params.start;
    }
    if (value >= x2) {
      return params.end;
    }
    let i = 0;
    while (params.points[i + 1][0] < value) {
      i++;
    }
    const [x0, y0] = params.points[i];
    const [x3, y3] = params.points[i + 1];
    const t = (value - x0) / (x3 - x0);
    const a = y3 - y2 - y0 + y1;
    const b = y0 - y1 - a;
    const c = y2 - y0;
    const d = y1;
    return a * t * t * t + b * t * t + c * t + d;
  };

  const colors: Color[] = [];

  for (let j = 0; j < ranges.length; j++) {
    // TODO: Add support for color curves
    const {
      count,
      background,
      foreground,
      hueCurve = {
        start: 0,
        end: 360,
        points: [
          [0, 0],
          [360, 360],
        ],
      },
      saturationCurve = {
        start: 0,
        end: 100,
        points: [
          [0, 0],
          [100, 100],
        ],
      },
      lightnessCurve = {
        start: 0,
        end: 100,
        points: [
          [0, 0],
          [100, 100],
        ],
      },
    } = ranges[j];

    const hueStep = (foreground.h - background.h) / count;
    const saturationStep = (foreground.s - background.s) / count;
    const lightStep = (foreground.l - background.l) / count;

    for (let i = j; i < count; i++) {
      const color: Color = {
        h: background.h + hueStep * i,
        s: background.s + saturationStep * i,
        l: background.l + lightStep * i,
      };

      color.h = interpolateValue(hueCurve, color.h);
      color.s = interpolateValue(saturationCurve, color.s);
      color.l = interpolateValue(lightnessCurve, color.l);

      colors.push(color);
    }

    colors.push(foreground);
  }

  return colors;
}
