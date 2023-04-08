<script lang="ts">
  import radioColor from '../package/index';
  import type {ColorOptions} from '../package/index.type';
  import {onMount} from 'svelte';

  export let colors: ColorOptions[] = [];
  export let target = '';
  export let async = false;
  let style = '';
  let mounted = false;

  const {setTarget, setColors, stylesheet, clearStyles} = radioColor();

  $: if (async === false) {
    clearStyles();
    setColors(colors);
    style = stylesheet();
    if (target !== undefined) {
      setTarget(target);
    }
  }

  $: if (async === true && mounted === true) {
    clearStyles();
    setColors(colors);

    if (target !== undefined) {
      setTarget(target);
    }
    style = stylesheet();
  }

  onMount(() => {
    mounted = true;
  });
</script>

<svelte:element this="style">{style}</svelte:element>
<slot />
