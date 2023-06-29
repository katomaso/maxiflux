<script>
    import { onMount } from "svelte";
    import { client, connected, OK, NOT } from "./client.js";
    import { to_days, get_age, get_data, update, mark, clear } from "./cache.js";
    import { page, next, navigateTo, sneakPeakTo } from "./router.js";
    import Pager from "./Pager.svelte";

    let data = null;
    async function refresh_data(force_refresh) {
        let age = get_age()
        if ($connected == NOT && (age < 0 || force_refresh)) {
            $next = "Articles";
            $page = "Connect";
        } else if ($connected == OK && (force_refresh || age < 0)) {
            console.log(`Refreshing data because force_refresh(${force_refresh}) or age(${age}) < 0`);
            data = await client.get_entries(); // TODO: user-defined ordering {order: "changed_at"}
            await clear();
            await update(data);
        } else {
            // handle offline case
            data = await get_data();
        }
    }

    onMount(() => refresh_data(false));
</script>

<main>
    {#if data}
    <Pager/>
    {@const days_old = to_days(get_age())}
    <nav>
        {#if $connected == NOT}
        <button on:click={(_) => sneakPeakTo("Connect", "Articles")}>Connect</button>
        {:else}
        <button on:click={(e) => refresh_data(true)}>🔄</button>{#if days_old > 0}<em>(last sync {days_old} days ago)</em>{/if}
        {/if}
    </nav>
    <h1>Articles ({data.total})</h1>
    <nav>
        <span><button>Read</button>/<button>Unread</button></span>
        <select name="sort">
            <option value="">-- sort by --</option>
            <option value="-last_changed">Newest</option>
            <option value="+last_changed">Oldest</option>
            <option value="random">Random</option>
        </select>
    </nav>
    <ul>
    {#each data.entries.filter(e => e.status == "unread") as entry}
      <li>
        <button class="close" on:click={(e) => {mark(entry.id, "REMOVED"); refresh_data()}}>x</button>
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
        color: white;
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
