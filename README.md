# Radio Color System

A color library for Svelte.

Its main purpose is to create the background color palette with the given color and add text with the right contrast ratio on this background.

* Works independently of any design system and it has a single purpose.
* Can dynamically create a color palette based on visual content.
* Allows you to work asynchronously and gain from the colors that will come pre-loaded in your project.

Plans to improve color inputs and outputs according to [css color 4](https://www.w3.org/TR/css-color-4/)

## Installation

To install rcs, simply add it to your project's dependencies:

```bash
npm install radio-color-system
```

## Usage

To use RCS, import it into your Svelte component and create your color palette as needed:

### User generated static colors

```svelte
<script>
  import { RadioStatic } from 'radio-color-system'
  const colors = [
    {
      color: { h: 246, s: 32, l: 48 },
      name: 'primary',
    },
  ]
</script>

<RadioStatic {colors}>
  <div class="primary-80 primary-font-80">
    <h2>Primary Color</h2>
    <div class="container">
      {#each [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as codes}
        <div
          class={`primary-${codes} primary-font-${codes}`}
        >
          {codes}
        </div>
      {/each}
    </div>
  </div>
</RadioStatic>

<style>
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .container div {
    width: 100px;
    height: 100px;
    padding: 1rem;
    font-size: 1.5rem;
  }

  h2 {
    font-weight: 400;
    margin: 0;
    padding: 1.5rem 0;
  }
</style>
```

### Content-based color palettes

It takes the dominant hue value in the image and allows it to be used in the component.

```svelte
<script>
  import { RadioActive } from 'radio-color-system'
</script>

<RadioActive>
  <div class="dynamic-80">
    <h3 class="dynamic-font-80">Dynamic color</h3>
    <img src="./image.png" alt="dynamic" />
  </div>
</RadioActive>

```

RadioActive allows the end user to edit the theme according to the content they are interacting with. You can use it for content that may be irrelevant to your color palette and provide a more personalized experience.

It converts the color values in the current image to hsl format and groups them. Uses the dominant one of these colors, and expects the colors to be between a certain light and saturation value.

If the image is not suitable for the algorithm, it will return the default color. More information about the exceptions; [CanvasRenderingContext2D: getImageData()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData#exceptions)
