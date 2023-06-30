<script>
    function page(direction="up") {
        // doesn't really work
        // window.dispatchEvent(new KeyboardEvent("keypress", {
        //     'key': direction == "up" ? "PageUp" : "PageDown",
        //     'code': direction == "up" ? "PageUp" : "PageDown"
        // }))
        let shift = Math.round(window.window.visualViewport.height * 0.9);
        if (direction == "up") {
            window.scroll(0, window.scrollY - shift);
        } else {
            window.scroll(0, window.scrollY + shift);
        }
    }
</script>

<style>
div {
    position: fixed;
    top: 2rem;
    right: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    height: 90vh;
}
button {
    width: 4rem;
    height: 33vh;
    text-align: center;
    line-height: 2rem;
    display: block;
    padding: 0 0.1rem;
}
</style>

<main>
    <div>
        <button on:click|preventDefault="{() => page('up')}">▲</button>
        <button on:click|preventDefault="{() => page('down')}">▼</button>
    </div>
</main>
