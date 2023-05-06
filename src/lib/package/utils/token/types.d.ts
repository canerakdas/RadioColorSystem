import type {Color} from '../range/types';

export type TokenColors = {light: Color; dark?: Color};

export type Gamut =
  | 'srgb'
  | 'srgb-linear'
  | 'display-p3'
  | 'a98-rgb'
  | 'prophoto-rgb'
  | 'rec2020'
  | string;
