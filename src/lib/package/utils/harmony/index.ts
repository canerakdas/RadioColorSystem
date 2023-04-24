/**
 * @fileoverview This module exports a function for generating harmonious colors
 * based on a given color, harmony type, and configuration object.
 */
import type {ColorConfiguration} from '$lib/package/types';
import type {Color} from '../range/types';

export const harmonies = {
  triadic: [0, 120, 240],
  complementary: [0, 150, 210],
  splitComplementary: [150, 210],
  tetradic: [0, 90, 180, 270],
  square: [0, 90, 180, 270],
  analogous: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
};

/**
 * Sets harmonious colors based on given parameters.
 * @param {ColorConfiguration['name'] | ColorConfiguration['name'][]} name - The name(s) of the color(s) to generate.
 * @param {ColorConfiguration['harmony']} harmony - The type of harmony to use for generating colors.
 * @param {Color} color - The base color to use for generating harmonious colors.
 * @param {ColorConfiguration} configuration - The configuration object to use for generating colors.
 * @param {(config: ColorConfiguration[]) => void} callback - The callback function to call with the generated colors.
 * @returns {void}
 */
function setHarmonies(
  name: ColorConfiguration['name'],
  harmony: ColorConfiguration['harmony'],
  color: Color,
  configuration: ColorConfiguration,
  callback: (config: ColorConfiguration[]) => void
): void {
  if (Array.isArray(name) === true && typeof name !== 'undefined') {
    let cursor = Array(name.length)
      .fill(0)
      .map((_, i) => (i * 360) / name.length);

    if (typeof harmony !== 'undefined') {
      if (name.length <= harmonies[harmony].length) {
        cursor = harmonies[harmony];
      } else {
        console.warn('The number of colors must match the number of harmonies');
      }
    }

    for (let i = 0; i < name.length; i++) {
      const {h, s, l} = color;
      const config = {
        ...configuration,
        name: name[i],
        color: {
          h: (h + cursor[i]) % 360,
          s,
          l,
        },
      };
      callback([config]);
    }
  }
}

export default setHarmonies;
