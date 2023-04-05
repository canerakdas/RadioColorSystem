# Radio Color System

Radio Color System is a library of dynamic colors and color utilities for Svelte, inspired by the Material Color System. With Radio Color System, you can easily add a consistent and visually appealing color scheme to your Svelte projects.

## Features

- Dynamic color
- Provides correct contrast rated background and text color
-

## Installation

To install rcs, simply add it to your project's dependencies:

```bash
npm install radio-color-system
```

## Usage

To use RCS, import it into your Svelte component and create your color palette as needed:

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
