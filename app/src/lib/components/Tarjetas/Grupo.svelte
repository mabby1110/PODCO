<!-- Grupo.svelte -->
<script>
    import { page } from '$app/state';
    import { appState } from '$lib/stores/appState.svelte';
    import { StoreModList } from '$lib/stores/StoreModList.svelte';
    import { tick } from 'svelte';

    let { agrupacion, showByDefault = false, children } = $props();
    
    let { clientes, agentes, oportunidades } = $derived(page.data);
    let categoria = $derived(StoreModList.get(page.url.pathname).groupBy);
    
    let show = $derived(showByDefault);
    
    let groupTitle = $derived.by(() => {
        return agrupacion.columna;
    });

    let listRef = $state();

    async function handleToggle() {
        appState.toggleMin();
        await tick();

        if (listRef) {
            listRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
</script>

<div class="group-container" bind:this={listRef}>
    <button class="group-header" onclick={handleToggle}>
        <h3 class="dia-header">{groupTitle} ({agrupacion.items.length})</h3>
    </button>

    {#if show}
        <div class="group-list">
            {@render children()}
        </div>
    {/if}
</div>

<style>
    .group-header {
        all: unset;
        padding: var(--a);
        border-radius: var(--a);
        z-index: 9;
        background-color: white;
        width: fit-content;
        position: sticky;
        top: 0;
    }
    .group-header:hover {
        cursor: pointer;
        background-color: white;
    }
    .group-list {
        display: flex;
        flex-direction: column;
        gap: var(--a);
        padding: var(--a);
    }
</style>