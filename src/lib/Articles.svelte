<script>
    import { onMount } from "svelte";
    import { client, connected, OK, NOT } from "./client.js";
    import { get_age, get_data, update_data } from "./cache.js";
    import { page, next, navigateTo } from "./router.js";

    let data = null;
    async function refresh_data(force_refresh) {
        let age = get_age()
        if ($connected == NOT && (age == null || force_refresh)) {
            $next = "Articles";
            $page = "Connect";
        } else if ($connected == OK && (force_refresh || age == null)) {
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
    <div>Articles are {Math.round(get_age()/3600/1000)} days old
        <button on:click={(e) => refresh_data(true)}>Refresh articles</button> (you are currently {$connected})
    </div>
    <h1>Articles</h1>
        Found {data.total} articles<br>
        {#each data.entries as entry }
        <div style="display:flex;flex-direction:row;justify-content:space-between;">
            <button class="close">x</button>
            <span style="flex-grow:4">
                <h3>{entry.title}</h3>
                <em>By {entry.author}<date> on {new Date(entry.changed_at).toLocaleDateString()}</date></em>
            </span>
            <button class="read" on:click={(e) => navigateTo("Article", {id:entry.id})}>&gt;</button>
        </div>
        {/each }
    {/if}
</main>

<style>
    div {
        margin-bottom: 2em;
        border: 2px solid grey;
    }
    button {
        display: inline-block;
        font-size: 32pt;
    }
    .close {
        color: red;
    }
    .read {
        color: green;
    }
</style>
