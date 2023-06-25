<script>
  import { onMount, afterUpdate } from "svelte";
  import { get_entry, mark } from "./cache.js";
  import { navigateTo } from "./router.js";

  export let id;
  let article;
  let fresh = true;

  async function load_data() {
    article = await get_entry(id);
  }

  let read_marker = new IntersectionObserver(() => { if(fresh) {fresh = false} else mark(id, "READ"); }, {
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
  <nav id="nav-top" style="display:flex;justify-content:space-between">
    <button on:click={() => navigateTo("Articles")}>🔙 Articles</button>
    {#if article.status == "unread"}
      <button on:click={() => mark(id, "READ")}>✔️ Mark read</button>
    {/if}
    <button on:click={() => {mark(id, "REMOVED"); navigateTo("Articles")}}>👋 Delete</button>
  </nav>
  <h3>{article.title} ({article.status})</h3>
  <p>{@html article.content}</p>
  <br>
  <nav id="nav-bottom" style="display:flex;justify-content:space-between">
    <button on:click={() => navigateTo("Articles")}>🔙 Articles</button>
    <button on:click={() => {mark(id, "REMOVED"); navigateTo("Articles")}}>👋 Delete</button>
  </nav>
  {/if}
</main>
