<script>
  import {page, params} from './lib/router.js'
  import Connect from './lib/Connect.svelte'
  import Articles from './lib/Articles.svelte'
  import Article from './lib/Article.svelte'
</script>

<main>
  {#if $page == "Connect"}
  <Connect/>
  {:else if $page == "Article"}
  <Article id={($params)["id"]} />
  {:else if $page == "Articles" || $page == ""}
  <Articles/>
  {/if}
</main>
