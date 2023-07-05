<script>
  import { onMount, beforeUpdate, afterUpdate } from "svelte";
  import { cache } from "./cache.js";
  import { filter } from "./filter.js";
  import { navigateTo } from "./router.js";
  import Pager from "./Pager.svelte";

  export let id;

  let article = null;

  async function load_data() {
    article = await cache.get_entry(id);
  }

  function change_article(x) {
    window.scroll(0, 0);
    article = x;
  }
  onMount(load_data);
</script>

<main>
  {#if article}
  <Pager/>
  <nav>
    <button on:click={() => navigateTo("Articles")}>🔙 Articles</button>
    <button on:click={() => {cache.mark(id, "REMOVED"); navigateTo("Articles")}}>👋 Delete</button>
    <button on:click={() => {cache.next_article(article, filter).then(change_article)}}>Next 🢥</button>
  </nav>
  <h1>{article.title} ({article.status})</h1>
  <article>
    {@html article.content}
  </article>
  <br>
  <nav id="nav-bottom">
    <button on:click={() => {cache.mark(article.id, "READ"); navigateTo("Articles");} }>🔙 Articles</button>
    <button on:click={() => {cache.mark(article.id, "REMOVED"); cache.next_article(article, filter).then(change_article)}}>👋 Delete</button>
    <button on:click={() => {cache.mark(article.id, "READ"); cache.next_article(article, filter).then(change_article)}}>Next 🢥</button>
  </nav>
  {/if}
</main>

<style>
  nav {
    display: flex;
    justify-content: space-between;
  }
</style>