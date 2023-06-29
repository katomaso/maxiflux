<script>
  import { onMount, afterUpdate } from "svelte";
  import { get_entry, get_next, mark } from "./cache.js";
  import { navigateTo } from "./router.js";
  import Pager from "./Pager.svelte";

  export let id;

  let article;
  let fresh = true;

  async function load_data() {
    article = await get_entry(id);
    document.addEventListener("keydown", (event) => console.log(event));
  }

  function change_article(x) {
    window.scroll(0, 0);
    fresh = true;
    article = x;
  }

  let read_marker = new IntersectionObserver(() => { if(article && fresh) {fresh = false} else mark(article.id, "READ"); }, {
    root: document.querySelector("#scrollArea"),
    rootMargin: "0px",
    threshold: 1.0,
  });
  let observer_called = false;

  onMount(load_data);

  afterUpdate(() => {
    let el = document.querySelector("#nav-bottom");
    if (el && !observer_called) {
      read_marker.observe(el);
      observer_called = true;
    };
    console.log("After update called");
    fresh = true;
	});
</script>

<main>
  {#if article}
  <Pager/>
  <nav>
    <button on:click={() => navigateTo("Articles")}>🔙 Articles</button>
    <button on:click={() => {mark(id, "REMOVED"); navigateTo("Articles")}}>👋 Delete</button>
    <button on:click={() => {mark(article.id, "READ"); get_next(article).then(change_article)}}>Next 🢥</button>
  </nav>
  <h1>{article.title} ({article.status})</h1>
  {@html article.content}
  <br>
  <nav id="nav-bottom">
    <button on:click={() => {mark(article.id, "READ"); navigateTo("Articles");} }>🔙 Articles</button>
    <button on:click={() => {mark(article.id, "REMOVED"); navigateTo("Articles")}}>👋 Delete</button>
    <button on:click={() => {mark(article.id, "READ"); get_next(article).then(change_article)}}>Next 🢥</button>
  </nav>
  {/if}
</main>

<style>
  nav {
    display: flex;
    justify-content: space-between;
  }
</style>