<script lang="ts">
  import {onMount} from 'svelte';

  import radioColor, {getImageColor} from '../package/index';
  import type {ColorConfiguration} from '../package/index.type';

  export let target = '';
  export let async = false;
  export let color: ColorConfiguration = {
    color: {h: 0, s: 0, l: 50},
    name: 'dynamic',
  };

  const {setTarget, setColors, stylesheet, clearStyles} = radioColor();
  let style = '';
  let mounted = false;

  if (color.name !== undefined) {
    setTarget(`#${color.name}`);
  }

  if (async === false) {
    clearStyles();
    setColors([color]);
    style = stylesheet();
  }

  $: if (mounted) {
    clearStyles();

    getImageColor({
      name: color.name || '',
      target: target,
      callback: (c: ColorConfiguration) => {
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
