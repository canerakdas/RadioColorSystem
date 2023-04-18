<script>
  import { RadioStatic } from '../lib/index'
  const colors = [
    {
      color: '#0011ff',
      name: 'primary',
      gamut: 'prophoto-rgb',
    },
  ]
</script>

<RadioStatic {colors}>
  <div class="primary-80 primary-font-80">
    <h2>Primary Color</h2>
    <div class="container">
      {#each [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as code}
        <div
          class={`primary-${code} primary-font-${code}`}
        >
          {code}
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