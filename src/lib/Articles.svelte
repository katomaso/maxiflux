<script>
    import { onMount } from "svelte";
    import { client, connected, OK, NOT } from "./client.js";
    import { to_days, get_age, get_data, update_data, mark } from "./cache.js";
    import { page, next, navigateTo, sneakPeakTo } from "./router.js";

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
    {@const age = to_days(get_age())}
    {#if $connected == NOT}
        <button on:click={(_) => sneakPeakTo("Connect", "Articles")}>Connect</button>
    {:else}
        <div>Articles are {#if age == 0}current{:else}{{age}}days old{/if}
            <button on:click={(e) => refresh_data(true)}>Refresh articles</button> (you are currently {$connected})
        </div>
    {/if}
    <h1>Articles</h1>
        Found {data.total} articles<br>
        {#each data.entries as entry}
        <div style="display:flex;flex-direction:row;">
            <a class="close" on:click={(e) => {mark(entry.id, "REMOVED"); refresh_data()}}>x</a>
            <span style="flex-grow:4">
                <h3>{entry.title}</h3>
                <em>By {entry.author}<date> on {new Date(entry.changed_at).toLocaleDateString()}</date></em>
            </span>
            <a class="read" on:click={(e) => navigateTo("Article", {"id" :entry.id})}>&gt;</a>
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
</style>
