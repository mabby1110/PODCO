<script lang="ts">
    import { appState } from '$lib/stores/appState.svelte';
    import CardActividadListPreview from '$lib/components/Actividad/CardActividadListPreview.svelte';
    import Leyenda from '../Leyenda.svelte';
    import Reload from '../Reload.svelte';
    import Filtro from '../Filtro.svelte';
    import { agrupacionesActividades, columnasActividad } from '$lib';
    import Grupo from '../Grupo.svelte';

    let { listaAgrupada } = $props();

    let show = $derived($appState.min);

    const steps = [
        { label: 'Programada', color: 'var(--color-secondary)' },
        { label: 'Finalizada', color: '#000000ee' }
    ];
</script>

<div class="view-container">
    <div class="controls">
        <Reload />
        <button onclick={() => appState.toggleModalActivity()} class="butter">+Actividad</button>
        <button onclick={appState.toggleMin} class="butter">
            {show ? 'min' : 'max'}
        </button>
        
        <Filtro
            columns={columnasActividad}
            agrupaciones={agrupacionesActividades}
        />
    </div>

    <Leyenda {steps} />

    {#each listaAgrupada as agrupacion (agrupacion.grupo)}
        <div class="grupo-dia">
            <Grupo {agrupacion} showByDefault={show}>
                {#each agrupacion.elementos as event (event.id)}
                    <CardActividadListPreview {event} />
                {/each}
            </Grupo>
        </div>
    {:else}
        <div class="no-results">
            <p>No se encontraron actividades con los filtros actuales.</p>
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