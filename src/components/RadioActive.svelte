<script lang="ts">
  import { onMount } from "svelte";

  import radioColor, { getImageColor } from "../lib/index";
  import type { ColorOptions } from "../lib/index.type";

  const { setTarget, setColors, stylesheet } = radioColor();

  let text = "";
  export let target = "";

  export let color: ColorOptions = {
    color: { h: 270, s: 2, l: 57 },
    name: "dynamic",
  };

  if (color.name !== undefined) {
    setTarget(`#${color.name}`);
  }

  $: colors = (c: ColorOptions) => {
    const t = [{ ...color, ...{ color: c.color } }];
    setColors(t);
    text = stylesheet();
  };

  setColors([color]);
  text = stylesheet();

  onMount(() => {
    getImageColor({
      name: color.name || "",
      target: target,
      callback: colors,
    });
  });
</script>

{@html `<style>${text}}</style>`}
<div id={color.name}>
  <slot />
</div>
