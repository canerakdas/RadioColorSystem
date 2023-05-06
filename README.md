# Radio Color System

Radio Color System is a color system for Svelte that creates background color palettes with the given color and adds text with the right contrast ratio on that background. Its main purpose is to improve accessibility by ensuring that text is legible against its background color.

## Introduction

As a developer, you want to make sure that the text on your website or application is readable and accessible to everyone. One way to do this is to ensure that there is enough contrast between the text and its background color. Radio Color System makes it easy to create color palettes that meet accessibility guidelines and ensure that your content is legible for all users.

## Features and Benefits

- Works independently of any design system and it has a single purpose.
- Can dynamically create a color palette based on visual content.
- Allows you to work asynchronously and gain from the colors that will come pre-loaded in your project.
- Supports color harmony generation to ensure visually appealing color combinations.
- Provides better accessibility by generating text colors with sufficient contrast ratios against the background colors.
- Helps to create visually consistent designs by maintaining a unified color palette throughout the project.
- Supports css color 4 color gamuts such as srgb, srgb-linear, display-p3, a98-rgb, prophoto-rgb, and rec2020.

## CSS Color 4

We plan to improve color inputs and outputs according to [CSS Color 4](https://www.w3.org/TR/css-color-4/), which is a new version of the CSS color module that adds new color definitions and features. This will help us to provide even more flexibility and options for creating color palettes.

## Docs and Demo

To see Radio Color System in action, check out the [docs and demo](https://radio-color-system.vercel.app/).

## Installation

To install Radio Color System, simply add it to your project's dependencies using npm:

```bash
npm install radio-color-system
```

## Usage

To use Radio Color System, import it into your Svelte component and create your color palette as needed. Here are a few examples:

### User-generated static colors

```svelte
<script>
  import { RadioStatic } from 'radio-color-system'

  const colors = [
    {
      color: '#5b5ba5',
      name: 'primary',
    },
  ]
</script>

<RadioStatic {colors}>
  <!-- Your content here -->
</RadioStatic>
```

### Content-based color palettes

```svelte
<script>
  import { RadioActive } from 'radio-color-system'
</script>

<RadioActive>
  <!-- Your content here -->
</RadioActive>
```

RadioActive takes the dominant hue value in the image and allows it to be used in the component. It's useful for content that may be irrelevant to your color palette and provides a more personalized experience. If the image is not suitable for the algorithm, it will return the default color. For more information about the exceptions, see [CanvasRenderingContext2D: getImageData()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData#exceptions).

For more information on how to use Radio Color System, please see the [documentation](https://radio-color-system.vercel.app/).

## Contributing

We welcome contributions from anyone! To get started, please see our [contribution guidelines](CONTRIBUTING.md).

## License

Radio Color System is licensed under the [MIT License](LICENSE).
