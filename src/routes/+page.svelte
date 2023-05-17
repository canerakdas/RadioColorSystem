<script>
  import { RadioStatic, RadioAccent } from '../lib/index'

  const colors = [
    {
      color: {
        h: 60,
        s: 50,
        l: 80,
      },
      name: ['primary','secondary', 'ter','a','b','c','d','e','f','g','h','i','n','o','p','q','r','s','t','u','v','w','x','y','z'],
      harmony: 'analogous',
    },
  ]

  const color ='red';
</script>

<RadioAccent>
  <div class="accent-50 accent-font-50">Accent Color Example</div>
</RadioAccent>

<RadioStatic {colors}>
  {#each colors as color}
    {#each color.name as name}
      <div class="{name}-80 {name}-font-80">
        <h2>{name} Color</h2>
        <div class="container">
          {#each [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] as code}
            <div
              class={`${name}-${code} ${name}-font-${code}`}
            >
              {code}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  {/each}
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