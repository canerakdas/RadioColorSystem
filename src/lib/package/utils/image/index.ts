/**
 * @fileoverview Image to color utilities.
 */
import type {ColorOptions} from '../..';
import {rgbToHsl} from '../helpers';
import type {ImageColor} from './index.d';

/**
 * Gets the dominant color of an image within a specified area, based on a set of limits.
 * @param {Object} options - The options for the method.
 * @param {string} options.name - The ID of the parent element that contains the image.
 * @param {string} [options.target=img] - The type of element to search for within the parent element.
 * @param {Object} [options.limits] - The limits for the color values.
 * @param {Object} [options.limits.light] - The limits for the lightness value.
 * @param {number} [options.limits.light.gt=20] - The minimum lightness value.
 * @param {number} [options.limits.light.lt=80] - The maximum lightness value.
 * @param {Object} [options.limits.saturation] - The limits for the saturation value.
 * @param {number} [options.limits.saturation.gt=20] - The minimum saturation value.
 * @param {number} [options.limits.saturation.lt=90] - The maximum saturation value.
 * @param {Object} [options.limits.hue] - The limits for the hue value.
 * @param {number} [options.limits.hue.gt=0] - The minimum hue value.
 * @param {number} [options.limits.hue.lt=360] - The maximum hue value.
 * @param {Function} options.callback - The callback function to call with the result.
 * @param {number} [options.quality=10] - The quality of the sampling.
 * @param {Object} [options.position] - The position and size of the area to sample.
 * @param {number} [options.position.cx=0] - The X-coordinate of the top-left corner of the area to sample, as a percentage of the image width.
 * @param {number} [options.position.cy=0] - The Y-coordinate of the top-left corner of the area to sample, as a percentage of the image height.
 * @param {number} [options.position.width=100] - The width of the area to sample, as a percentage of the image width.
 * @param {number} [options.position.height=100] - The height of the area to sample, as a percentage of the image height.
 */
export function getImageColor({
  name,
  target,
  limits = {
    light: {
      gt: 20,
      lt: 80,
    },
    saturation: {
      gt: 20,
      lt: 90,
    },
    hue: {
      gt: 0,
      lt: 360,
    },
  },
  callback,
  quality = 10,
  position = {
    cx: 0,
    cy: 0,
    width: 100,
    height: 100,
  },
}: ImageColor) {
  try {
    const {src} = document.querySelector(
      `#${name} ${target || 'img'}`
    ) as HTMLImageElement;

    // Create a new image object
    const image = new Image();

    // Set the image source to the same as the provided image
    image.src = src;

    // Wait for the image to load
    image.onload = function () {
      const canvas = document.createElement('canvas');

      const getPercent = (value: number, percent: number) => {
        if (percent >= 0) {
          return (value * percent) / 100;
        } else {
          return value;
        }
      };

      canvas.width = getPercent(image.width, position.width || 100);
      canvas.height = getPercent(image.height, position.height || 100);
      const context = canvas.getContext('2d');

      if (!context) throw new Error('Could not get canvas context');

      context.drawImage(
        image,
        (image.width * position.cx) / 100,
        (image.height * position.cy) / 100,
        canvas.width,
        canvas.height
      );

      // Get the primary color of the image using the Canvas API
      const {data} = context.getImageData(
        getPercent(image.width, position.cx),
        getPercent(image.height, position.cy),
        canvas.width,
        canvas.height
      );

      const counts: {[key: string]: number} = {};
      let max = 0;
      let dominant = [0, 0, 0];

      for (let cursor = 0; cursor < data.length; cursor += 4 * quality) {
        const [r, g, b] = data.slice(cursor, cursor + 3);
        const color = rgbToHsl(r, g, b);
        const hue = Math.floor(color.h);

        if (!counts[hue]) {
          counts[hue] = 0;
        }

        counts[hue]++;

        if (counts[hue] > max) {
          if (
            color.l > limits.light.gt &&
            color.l < limits.light.lt &&
            color.s > limits.saturation.gt &&
            color.s < limits.saturation.lt &&
            color.h < limits.hue.lt &&
            color.h > limits.hue.gt
          ) {
            max = counts[hue];
            dominant = [r, g, b];
          }
        }
      }

      callback({
        color: rgbToHsl(dominant[0], dominant[1], dominant[2]),
      } as ColorOptions);
    };
  } catch (error) {
    console.error(error);
    callback({color: {h: 0, s: 0, l: 0}} as ColorOptions);
  }
}
