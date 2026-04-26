<script lang="ts">
    import CardOpListPreview from '$lib/components/Oportunidad/CardOpListPreview.svelte';
    import Filtro from '$lib/components/Filtro.svelte';
    import { appState } from '$lib/stores/appState.svelte';
    import Leyenda from '../Leyenda.svelte';
    import Reload from '../Reload.svelte';
    import { agrupacionesOportunidades, columnasOportunidad } from '$lib';
    import Grupo from '../Grupo.svelte';

    let { listaAgrupada } = $props();

    let show = $derived($appState.min);
</script>

<div class="view-container">
    <div class="controls">
        <Reload />
        <button onclick={() => appState.toggleModalOp()} class="butter">+Oportunidad</button>
        <button onclick={appState.toggleMin} class="butter">
            {show ? 'min' : 'max'}
        </button>
        
        <Filtro
            columns={columnasOportunidad}
            agrupaciones={agrupacionesOportunidades}
        />
    </div>

    <Leyenda />

    {#each listaAgrupada as agrupacion (agrupacion.grupo)}
        <div class="grupo-dia">
            <Grupo {agrupacion} showByDefault={show}>
                {#each agrupacion.elementos as event (event.id)}
                    <CardOpListPreview {event} />
                {/each}
            </Grupo>
        </div>
    {:else}
        <div class="no-results">
            <p>No se encontraron oportunidades con los filtros actuales.</p>
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