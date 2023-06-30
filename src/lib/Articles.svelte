<script>
    import { onMount } from "svelte";
    import { client, sync_with_server, connected, OK, NOT } from "./client.js";
    import { cache } from "./cache.js";
    import { page, next, navigateTo, sneakPeakTo } from "./router.js";
    import Pager from "./Pager.svelte";

    let data = null;

    // convert miliseconds to days
    function as_days(age) {
        return Math.round(age / 1000 / 3600 / 24);
    }

    async function download() {
        if ($connected == NOT) {
            $next = "Articles";
            $page = "Connect";
            return;
        }
        if ($connected != OK) {
            console.log("Connection failed " + $connected);
        }
        await sync_with_server(cache.entries());
        return client.get_entries().then((data) => cache.clear().then(() => cache.update(data.entries)));
    }

    async function refresh_data() {
        let age = cache.get_age()
        if(age < 0) {
            await download();
        }
        data = await cache.query();
    }

    onMount(refresh_data);
</script>

<main>
    {#if data}
    <Pager/>
    {@const days_old = as_days(cache.get_age())}
    <nav id="download">
        {#if $connected == NOT}
        <button on:click={(_) => sneakPeakTo("Connect", "Articles")}>Connect</button>
        {:else}
        <select name="limit">
            <option value="all">limit</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="all">all</option></select>
        <button on:click={(e) => download()}>🔄</button>{#if days_old > 0}<em>(last sync {days_old} days ago)</em>{/if}
        {/if}
    </nav>
    <h1>Articles ({data.total})</h1>
    <nav>
        <span><button>Read</button>/<button>Unread</button></span>
        <select name="sort">
            <option value="">-- sort by --</option>
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="random">Random</option>
        </select>
    </nav>
    <ul>
    {#each data.entries as entry}
      <li>
        <button class="close" on:click={(e) => {cache.mark(entry.id, "REMOVED"); e.currentTarget.parentElement.remove();}}>x</button>
        <a href="article/{entry.id}" on:click|preventDefault={(e) => navigateTo("Article", {"id": entry.id})}>
            <h2>{entry.title}</h2>
            <em>From {entry.feed.title} on <date>{new Date(entry.changed_at).toLocaleDateString()}</date></em>
        </a>
      </li>
    {/each}
    </ul>
    {/if}
</main>

<style>
    ul {
        list-style: none;
        margin: 1em 0 0 0; padding: 0;
    }
    ul li {
        margin-bottom: 2em;
        border: 2px solid grey;
        display: flex;
    }
    ul li a {
        display: inline-block;
        color: #555;
        width: 100%;
        padding: 0.5em 1em;
    }
    ul li a h2 {
        text-align: left;
        margin: 0.1em 0;
        font-size: 12pt;
    }
    ul li a em {
        font-size: 10pt;
    }
    a:hover {
        background-color: rgba(0, 0, 0, 0.9);
    }
    .close {
        color: red;
    }
    nav {
        display: flex;
        justify-content: space-between;
    }
</style>
