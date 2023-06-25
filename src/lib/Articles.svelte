<script>
    import { onMount } from "svelte";
    import { client, connected, OK, NOT } from "./client.js";
    import { to_days, get_age, get_data, update_data, mark } from "./cache.js";
    import { page, next, navigateTo, sneakPeakTo } from "./router.js";

    let data = null;
    async function refresh_data(force_refresh) {
        let age = get_age()
        if ($connected == NOT && (age < 0 || force_refresh)) {
            $next = "Articles";
            $page = "Connect";
        } else if ($connected == OK && (force_refresh || age < 0)) {
            console.log(`Refreshing data because force_refresh(${force_refresh}) or age({$age}) < 0`);
            data = await client.get_entries({order: "changed_at"});
            update_data(data);
        } else {
            // handle offline case
            data = await get_data();
        }
    }

    onMount(() => refresh_data(false));
</script>

<main>
    {#if data}
    {@const days_old = to_days(get_age())}
    <nav class="absolute">
        {#if $connected == NOT}
        <button on:click={(_) => sneakPeakTo("Connect", "Articles")}>Connect</button>
        {:else}
        <button on:click={(e) => refresh_data(true)}>🔄</button>{#if days_old > 0}<em>(last sync {days_old} days ago)</em>{/if}
        {/if}
    </nav>
    <h1>Articles</h1>
        Found {data.total} articles<br>
        <h2>Unread articles</h2>
        {#each data.entries.filter(e => e.status == "unread") as entry}
        <div style="display:flex;flex-direction:row;">
            <button class="close" on:click={(e) => {mark(entry.id, "REMOVED"); refresh_data()}}>x</button>
            <span style="flex-grow:4">
                <h3>{entry.title}</h3>
                <em>From {entry.feed.title} on <date>{new Date(entry.changed_at).toLocaleDateString()}</date></em>
            </span>
            <a href="article/{entry.id}" class="read" on:click|preventDefault={(e) => navigateTo("Article", {"id": entry.id})}>&gt;</a>
        </div>
        {/each}

        <h2>Read articles</h2>
        {#each data.entries.filter(e => e.status == "read") as entry}
        <div style="display:flex;flex-direction:row;">
            <button class="close" on:click={(e) => {mark(entry.id, "REMOVED"); refresh_data()}}>x</button>
            <span style="flex-grow:4">
                <h3>{entry.title}</h3>
                <em>From {entry.feed.title} on <date>{new Date(entry.changed_at).toLocaleDateString()}</date></em>
            </span>
            <a href="article/{entry.id}" class="read" on:click|preventDefault={(e) => navigateTo("Article", {"id": entry.id})}>&gt;</a>
        </div>
        {/each}
    {/if}
</main>

<style>
    div {
        margin-bottom: 2em;
        border: 2px solid grey;
    }
    a {
        display: inline-block;
        margin: auto;
        font-size: 32pt;
        min-width: 2em;
        line-height: 2em;
        cursor: pointer;
    }
    a:hover {
        background-color: rgba(0, 0, 0, 0.9);
    }
    .close {
        color: red;
    }
    .read {
        color: green;
    }
    nav {
        position: absolute;
        top: 0;
        right: 0;
    }
</style>
