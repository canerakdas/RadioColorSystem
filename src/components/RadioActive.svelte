<script lang="ts">
  import {onMount} from 'svelte';

  import radioColor, {getImageColor} from '../lib/index';
  import type {ColorOptions} from '../lib/index.type';

  export let target = '';
  export let async = false;
  export let color: ColorOptions = {
    color: {h: 0, s: 0, l: 50},
    name: 'dynamic',
  };

  const {setTarget, setColors, stylesheet} = radioColor();
  let style = '';
  let mounted = false;

  if (color.name !== undefined) {
    setTarget(`#${color.name}`);
  }

  if (async === false) {
    setColors([color]);
    style = stylesheet();
  }

  $: if (mounted) {
    getImageColor({
      name: color.name || '',
      target: target,
      callback: (c: ColorOptions) => {
        setColors([{...color, ...{color: c.color}}]);
        style = stylesheet();
      },
    });
  }

  onMount(() => {
    mounted = true;
  });
</script>

<svelte:element this="style">{style}</svelte:element>
<div id={color.name}>
  <slot />
</div>
