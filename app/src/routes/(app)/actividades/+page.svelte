<script lang="ts">
    import { page } from '$app/state';
    import { procesarDatosReactivos } from '$lib/utils/filtro';
    import ActivityList from '$lib/components/Actividad/ActivityList.svelte';

    let { actividades } = $derived(page.data);
    
    let currentRoute = $derived(page.url.pathname);
    
    const listaAgrupada = $derived.by(() => procesarDatosReactivos(actividades, currentRoute));
</script>

<div class="page-content">
    <ActivityList {listaAgrupada} />
</div>

<style>
    .page-content {
        display: flex;
        flex-direction: column;
        overflow: auto;
    }
</style>