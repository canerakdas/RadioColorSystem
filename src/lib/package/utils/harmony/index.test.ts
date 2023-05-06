import {describe, expect, test} from '@jest/globals';
import setHarmonies from '.';
import type {ColorConfiguration} from '$lib/package/types';

describe('Harmony', () => {
  const names = ['a', 'b', 'c'];
  const output: ColorConfiguration[] = [];
  setHarmonies(
    names,
    'analogous',
    {h: 0, s: 50, l: 50},
    {
      color: {h: 0, s: 50, l: 50},
      name: names,
      harmony: 'analogous',
    },
    configs => {
      output.push(configs[0]);
    }
  );

  test('Callback must be correct length', () => {
    expect(output.length).toBe(names.length);
  });

  test('Callback must be return color with correct name', () => {
    output.map((config, i) => {
      expect(config.name).toBe(names[i]);
    });
  });

  test('[Analogous] Callback must be return color with correct hue value', () => {
    output.map((config, i) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(config.color.h).toBe(i * 30);
    });
  });
});

describe('When harmony name is string', () => {
  const names = 'a';
  const output: ColorConfiguration[] = [];

  setHarmonies(
    names,
    'analogous',
    {h: 0, s: 50, l: 50},
    {
      color: {h: 0, s: 50, l: 50},
      name: names,
      harmony: 'analogous',
    },
    configs => {
      output.push(configs[0]);
    }
  );

  test('Callback must be correct length', () => {
    expect(output.length).toBe(0);
  });
});

describe('When harmony count out of range', () => {
  const names = [
    'q',
    'w',
    'e',
    'e',
    'r',
    't',
    'y',
    'u',
    'i',
    'o',
    'p',
    'a',
    's',
    'd',
    'f',
    'g',
    'h',
    'j',
    'k',
    'l',
    'z',
    'x',
  ];
  const output: ColorConfiguration[] = [];

  setHarmonies(
    names,
    'analogous',
    {h: 0, s: 50, l: 50},
    {
      color: {h: 0, s: 50, l: 50},
      name: names,
      harmony: 'analogous',
    },
    configs => {
      output.push(configs[0]);
    }
  );

  test('Callback must be correct length', () => {
    expect(output.length).toBe(22);
    output.map(config => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(config.color.h).toBeLessThan(360);
    });
  });
});
