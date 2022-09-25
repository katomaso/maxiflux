<script>
  import { onMount } from "svelte";
  import { get_entry } from "./cache.js";
  import { client, mark_read } from "./client.js";
  import { EntryStatus } from "./miniflux.js";
  import { navigateTo } from "./router.js";

  export let id;
  let article;

  async function load_data() {
    article = await get_entry(id);
  }

  onMount(load_data);
</script>

<main>
  <nav style="display:flex;justify-content:space-between">
    <button on:click={() => navigateTo("Articles")}>🔙 Articles</button>
    <button on:click={() => mark_read(id)}>✔️ Mark read</button>
  </nav>
  {#if article}
  <h3>{article.title}</h3>
  <p>{@html article.content}</p>
  {/if}
</main>
