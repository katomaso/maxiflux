<script>
    import { onMount } from "svelte";
    import { client } from "./client.js";
    import { cache } from "./cache.js";
    import { filter } from "./filter.js";
    import { navigateTo, sneakPeakTo } from "./router.js";
    import Pager from "./Pager.svelte";

    let data = null;
    let feeds = null;

    export let force_sync = false;

    // convert miliseconds to days
    function as_days_ago(date) {
        return Math.round((new Date().getTime() - date.getTime()) / 1000 / 3600 / 24);
    }

    function formatDate(date) {
        return date.toLocaleDateString("en-GB", {month: "short", day: "numeric", year: "numeric"});
    }

    async function sync() {
        if (!client.connected) {
            console.log("Client not connected - redirecting to Connect");
            sneakPeakTo("Connect", {force_sync: true});
            return;
        }
        // update feed-list only when no feed is selected
        if(filter.feed == 0) {
            await cache.update_feeds(await client.get_feeds());
            feeds = await cache.get_feeds();
            await cache.clear();
        }
        await client.sync(await cache.get_entries());
        let _data = await client.query(filter);
        return cache.update(_data.entries);
    }

    async function refresh(_sync=false) {
        if(cache.age == null || _sync || force_sync) {
            force_sync = false;
            await sync();
        }
        if(!feeds) {
            feeds = await cache.get_feeds();
        }
        data = await cache.query(filter);
    }

    onMount(async () => {
        await cache.connect();
        refresh();
    });
</script>

<main>
    <nav>
        <span>
            {#if cache.age != null}
            Last sync: {#if as_days_ago(cache.age) > 0}{as_days_ago(cache.age)} days{:else}a moment{/if} ago |
            {/if}
            <button on:click={() => {refresh(true)}}>Sync ⭳</button>
        </span>
        <span>
            {#if feeds}
            <label for="sort">Feeds:</label>
            <select name="feed" on:change={(e) => {filter.setFeed(parseInt(e.target.value)); refresh();}}>
                <option value="0">All</option>
            {#each feeds as feed}
                {#if feed.id == filter.feed}<option value="{feed.id}" selected>{feed.title}</option>{:else}
                <option value="{feed.id}">{feed.title}</option>{/if}
            {/each}
            </select>
            {/if}
        </span>
    </nav>

    <Pager/>
    <h1>Articles{#if data} ({data.length}){/if}</h1>
    <nav>
        <span>
            <button on:click={(e) => {filter.setStatus("read"); refresh();}}>Read</button>
            /
            <button on:click={(e) => {filter.setStatus("unread"); refresh();}}>Unread</button>
        </span>
        <span>
            <label for="sort">Sort:</label>
            <select name="sort" on:change={(e) => {if(e.target.value == "latest") {filter.setDirectionDesc();} else {filter.setDirectionAsc()}; refresh();}}>
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
            </select>
        </span>
    </nav>
    {#if data}
    <em>Showing {data.length} from {#await cache.count then count}{count}{/await} cached records</em>
    <ul>
    {#each data as entry}
      <li>
        <button class="close" on:click={(e) => {cache.mark(entry.id, "REMOVED"); e.currentTarget.parentElement.remove();}}>x</button>
        <a href="article/{entry.id}" on:click|preventDefault={(e) => navigateTo("Article", {"id": entry.id})}>
            <h2>{entry.title}{#if entry.status == "read"}&nbsp;(read){/if}</h2>
            <em>From {entry.feed.title} published <date>{formatDate(entry.published_at)}, changed: {formatDate(entry.changed_at)}</date></em>
        </a>
      </li>
    {/each}
    </ul>
    {:else}
    No data - please hit sync button
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
    ul li button {
        border-radius: 0;
        background: none;
    }
    ul li button:hover {
        background-color: rgba(0, 0, 0, 0.2);
    }
    ul li a {
        display: inline-block;
        width: 100%;
        padding: 0.5em 1em;
        color: #eee;
        text-decoration: none;
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
        background-color: rgba(0, 0, 0, 0.2);
    }
    .close {
        color: red;
    }
    nav {
        display: flex;
        justify-content: space-between;
    }
    select {
        max-width: 8em;
        overflow: hidden;
    }
    @media (prefers-color-scheme: light) {
        ul li a {
            color: #333;
        }
    }
</style>
