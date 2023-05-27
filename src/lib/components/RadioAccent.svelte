<script lang="ts">
	import { onMount } from 'svelte';

	import radioColor, { getImageColor } from '../package/index';
	import type { ColorConfiguration } from '../package/index.type';

	export let target = '';
	export let async = false;
	export let colors: ColorConfiguration = [
		{
			color: { h: 0, s: 0, l: 50 },
			name: 'accent'
		}
	];

	const { setColors, stylesheet, clearStyles } = radioColor();
	let style = '';
	let mounted = false;
	const color = colors[0];
	const name = Array.isArray(color.name) ? color.name[0] : color.name;

	if (async === false) {
		clearStyles();
		setColors([color]);
		style = stylesheet();
	}

	$: if (mounted) {
		clearStyles();

    const element = document.createElement('div');
    element.style.backgroundColor = "AccentColor";
    document.body.appendChild(element);

    const computedStyle = window.getComputedStyle(element, null);
    const accentColor = computedStyle.getPropertyValue("background-color");

    document.body.removeChild(element);

    setColors([{ ...color, ...{ color: accentColor } }]);
    style = stylesheet();
	}

	onMount(() => {
		mounted = true;
	});
</script>

<svelte:element this="style">{style}</svelte:element>
<div id={name}>
	<slot />
</div>
