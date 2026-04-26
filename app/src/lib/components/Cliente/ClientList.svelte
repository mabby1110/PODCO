<script lang="ts">
    import { agrupacionesCliente, columnasCliente } from '$lib';
    import CardClienteListPreview from '$lib/components/Cliente/CardClienteListPreview.svelte';
    import { appState } from '$lib/stores/appState.svelte';
    import Filtro from '../Filtro.svelte';
    import Grupo from '../Grupo.svelte';
    import Reload from '../Reload.svelte';

    let { listaAgrupada } = $props<{ listaAgrupada: any[] }>();

    let show = $derived($appState.min);
</script>

<div class="view-container">
    <div class="controls">
        <Reload />
        <button onclick={() => appState.toggleModalClient()} class="butter">+Cliente</button>
        <button onclick={appState.toggleMin} class="butter">
            {show ? "min" : "max"}
        </button>
        <Filtro 
            columns={columnasCliente} 
            agrupaciones={agrupacionesCliente}
        />
    </div>

    {#each listaAgrupada as agrupacion (agrupacion.grupo)}
        <div class="grupo-dia">
            <Grupo {agrupacion} showByDefault={show}>
                {#each agrupacion.elementos as elemento (elemento.id)}
                    <CardClienteListPreview client={elemento} />
                {/each}
            </Grupo>
        </div>
    {:else}
        <div class="no-results">
            <p>No se encontraron clientes con los filtros actuales.</p>
        </div>
    {/each}
</div>

<style>
    .view-container {
        display: flex;
        flex-direction: column;
        gap: var(--a);
        padding-bottom: var(--f);
    }

    .controls {
        display: flex;
        flex-wrap: wrap;
        gap: var(--a);
        align-items: center;
    }

    .no-results {
        text-align: center;
        padding: 2rem;
        color: #64748b;
    }

    .grupo-dia {
        display: flex;
        flex-direction: column;
        gap: var(--a);
    }
</style>