<!-- Grupo.svelte -->
<script>
    import { page } from '$app/state';
    import { fases, fases_actividad } from '$lib';
    import { appState } from '$lib/stores/appState.svelte';
    import { StoreModList } from '$lib/stores/StoreModList.svelte';
    import { tick } from 'svelte';

    let { agrupacion, showByDefault = false, children } = $props();
    
    let { clientes, agentes, oportunidades } = $derived(page.data);
    let categoria = $derived(StoreModList.get(page.url.pathname).groupBy);
    
    let show = $derived(showByDefault);
    
    let groupTitle = $derived.by(() => {
        if (!categoria) return agrupacion.columna;

        if (categoria === 'fase') {
            if (page.url.pathname === '/actividades') {
                return fases_actividad.find((i) => i.id_fase == agrupacion.columna)?.actual || agrupacion.columna;
            }
            if (page.url.pathname === '/oportunidades') {
                return fases.find((i) => i.id_fase == agrupacion.columna)?.actual || agrupacion.columna;
            }
        } 
        
        if (categoria === 'id_cliente') {
            let cliente = clientes.find((c) => c.id == agrupacion.columna);
            return cliente ? (cliente.nombre_comercial || cliente.razon_social) : agrupacion.columna;
        } 
        
        if (categoria === 'id_agente') {
            let agente = agentes.find((c) => c.id == agrupacion.columna);
            return agente ? agente.nombre : agrupacion.columna;
        } 
        
        if (categoria === 'id_oportunidad') {
            let oportunidad = oportunidades.find((c) => c.id == agrupacion.columna);
            if (!oportunidad) return agrupacion.columna;
            
            let cliente = clientes.find((c) => c.id == oportunidad.id_cliente);
            return cliente 
                ? `${cliente.nombre_comercial || cliente.razon_social} ${oportunidad.motivo}` 
                : agrupacion.columna;
        }
        
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
        <p class="dia-header">{groupTitle} ({agrupacion.items.length})</p>
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