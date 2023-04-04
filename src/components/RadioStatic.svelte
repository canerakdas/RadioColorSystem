<script lang="ts">
  import radioColor from "../lib/index";
  import type { ColorOptions } from "../lib/index.type";

  export let colors: ColorOptions[] = [];

  const { setTarget, setColors, stylesheet } = radioColor();

  export let target = "";

  if (target !== undefined) {
    setTarget(target);
  }

  setColors(colors);

  $: text = stylesheet();
</script>

{@html `<style>${text}}</style>`}
<slot />
