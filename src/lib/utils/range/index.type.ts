/**
 * An object describing the curve used for interpolation
 * @typedef {Object} CurveParams
 * @property {number} start - The starting value of the curve
 * @property {number} end - The ending value of the curve
 * @property {Array<[number, number]>} points - An array of control points for the curve
 */
export type CurveParams = {
  start: number;
  end: number;
  points: [number, number][];
};

/**
 * An object describing an HSL color
 * @typedef {Object} Color
 * @property {number} h - The hue value of the color (0-360)
 * @property {number} s - The saturation value of the color (0-100)
 * @property {number} l - The lightness value of the color (0-100)
 */
export type Color = {
  h: number;
  s: number;
  l: number;
};

/**
  A range of colors.
  @typedef {Object} Range
  @property {number} count - The number of colors to generate in the range.
  @property {Color} background - The starting color of the range.
  @property {Color} foreground - The ending color of the range.
  @property {CurveParams} [hueCurve] - Optional curve parameters to adjust the hue values of the colors.
  @property {CurveParams} [saturationCurve] - Optional curve parameters to adjust the saturation values of the colors.
  @property {CurveParams} [lightnessCurve] - Optional curve parameters to adjust the lightness values of the colors.
  */
export type Range = {
  count: number;
  background: Color;
  foreground: Color;
  hueCurve?: CurveParams;
  saturationCurve?: CurveParams;
  lightnessCurve?: CurveParams;
};
