<script>
  import {page, params, navigateTo} from './lib/router.js'
  import Connect from './lib/Connect.svelte'
  import Articles from './lib/Articles.svelte'
  import Article from './lib/Article.svelte'

  navigateTo("Articles"); // homepage
</script>

<main>
  {#if $page == "Connect"}
  <Connect/>
  {:else if $page == "Article"}
  <Article id={($params)["id"]} />
  {:else if $page == "Articles"}
  <Articles/>
  {:else}
  Unknown page {$page}
  {/if}
</main>
