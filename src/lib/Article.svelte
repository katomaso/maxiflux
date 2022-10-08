<script>
  import { onMount } from "svelte";
  import { get_entry, mark } from "./cache.js";
  import { navigateTo } from "./router.js";

  export let id;
  let article;

  async function load_data() {
    article = await get_entry(id);
  }

  onMount(load_data);
</script>

<main>
  {#if article}
  <nav style="display:flex;justify-content:space-between">
    <button on:click={() => navigateTo("Articles")}>🔙 Articles</button>
    {#if article.status == "unread"}
      <button on:click={() => mark(id, "READ")}>✔️ Mark read</button>
    {/if}
    <button on:click={() => {mark(id, "REMOVED"); navigateTo("Articles")}}>👋 Delete</button>
  </nav>
  <h3>{article.title} ({article.status})</h3>
  <p>{@html article.content}</p>
  {/if}
</main>
