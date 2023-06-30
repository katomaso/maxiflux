<script>
  import { onMount, beforeUpdate, afterUpdate } from "svelte";
  import { cache } from "./cache.js";
  import { navigateTo } from "./router.js";
  import Pager from "./Pager.svelte";

  export let id;

  let article = null;
  let fresh = true;

  async function load_data() {
    article = await cache.get_entry(id);
  }

  function change_article(x) {
    window.scroll(0, 0);
    article = x;
  }
  onMount(load_data);

  let read_marker = new IntersectionObserver(() => { if(article && fresh) {fresh = false} else cache.mark(article.id, "READ"); }, {
    root: document.querySelector("#scrollArea"),
    rootMargin: "0px",
    threshold: 1.0,
  });
  
  beforeUpdate(() => {
    fresh = true; // reset freshness before state change
  })

  let marker_bound = false;
  afterUpdate(async () => {
    let el = document.querySelector("#nav-bottom");
    if (el && !marker_bound) {
      read_marker.observe(el);
      marker_bound = true;
    };
  });
</script>

<main>
  {#if article}
  <Pager/>
  <nav>
    <button on:click={() => navigateTo("Articles")}>🔙 Articles</button>
    <button on:click={() => {cache.mark(id, "REMOVED"); navigateTo("Articles")}}>👋 Delete</button>
    <button on:click={() => {cache.mark(article.id, "READ"); cache.get_next(article).then(change_article)}}>Next 🢥</button>
  </nav>
  <h1>{article.title} ({article.status})</h1>
  {@html article.content}
  <br>
  <nav id="nav-bottom">
    <button on:click={() => {cache.mark(article.id, "READ"); navigateTo("Articles");} }>🔙 Articles</button>
    <button on:click={(e) => {cache.mark(article.id, "REMOVED"); e.currentTarget.remove()}}>👋 Delete</button>
    <button on:click={() => {cache.mark(article.id, "READ"); cache.get_next(article).then(change_article)}}>Next 🢥</button>
  </nav>
  {/if}
</main>

<style>
  nav {
    display: flex;
    justify-content: space-between;
  }
</style>