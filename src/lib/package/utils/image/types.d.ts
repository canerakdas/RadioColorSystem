import type {ColorConfiguration} from '../../types';

export type ImageColor = {
  name: string;
  target?: string;
  limits?: {
    light: {
      gt: number;
      lt: number;
    };
    saturation: {
      gt: number;
      lt: number;
    };
    hue: {
      gt: number;
      lt: number;
    };
  };
  callback: (c: ColorConfiguration) => void;
  quality?: number;
  position?: {
    cx: number;
    cy: number;
    width: number;
    height: number;
  };
};
