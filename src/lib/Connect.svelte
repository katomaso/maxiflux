<script>
    import { onMount } from "svelte";
    import { client } from "./client.js";
    import { page, next } from "./router.js";

    let url = localStorage.getItem("login_url") || "https://";
    let username = localStorage.getItem("login_username");
    let password = "";
    let remember = localStorage.getItem("login_remember") == "yes";
    let error = null;

    async function login(e) {
        if(!url.startsWith("https://")) {
            url = "https://" + url; 
        }
        if(password == "") {
            password = localStorage.getItem("login_password");
            if(password == "") return;
        }
        let connected = await client.connect(url, username, password);
        if(connected) {
            console.log("Successfuly logged in");
            localStorage.setItem("login_last", new Date().toISOString());
            localStorage.setItem("login_url", url);
            localStorage.setItem("login_username", username);
            if(remember) {
                localStorage.setItem("login_remember", "yes");
                localStorage.setItem("login_password", password);
            } else {
                localStorage.setItem("login_remember", "no");
            }
            return page.set($next || "Articles");
        } else {
            error = true;
        }
    }
    if(remember) { // && is_older_than(new Date(localStorage.setItem("login_last"), "5d"))
        onMount(login);
    }
</script>

<main>
    <form on:submit|preventDefault={login} method="POST">
        <label for="url">Server</label><input type="text" name="url" bind:value={url}><br>
        <label for="username">Username</label><input type="text" name="username" bind:value={username}><br>
        <label for="password">Password</label><input type="password" name="password" bind:value={password}><br>
        {#if error}<br><em class="error">{#if client.offline}You are offline <button on:click={() => page.set($next || "Articles")}>Go back</button>{:else}Login failed{/if}</em><br>{/if}
        <input type="submit" value="Connect" on:click|preventDefault|stopPropagation={login}>
        <input type="checkbox" name="remember" bind:value={remember}>&nbsp;Zapamatovat heslo
        <br>
    </form>
</main>

<style>
label {
  min-width: 8em;
  display: inline-block;
  text-align: right;
  margin-right: 0.5em;
}
</style>