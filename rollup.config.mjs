import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';

const name = 'radio-color-system';

export default {
  input: 'src/index.ts',
  output: [
    {file: 'build/index.mjs', format: 'es'},
    {file: 'build/index.js', format: 'umd', name},
  ],
  plugins: [
    svelte({
      preprocess: sveltePreprocess(),
    }),
    resolve(),
    typescript(),
  ],
  external: ['css-tree'],
};
