<script lang="ts">
    import { page } from '$app/state';
	import DocList from '$lib/components/Documentos/DocList.svelte';
    import { procesarDatosReactivos } from '$lib/utils/filtro';

    let { documentos } = $derived(page.data);
    
    let currentRoute = $derived(page.url.pathname);
    
    const listaAgrupada = $derived.by(() => procesarDatosReactivos(documentos, currentRoute));
    $effect(()=>console.log(documentos));
</script>

<div class="page-content">
    <DocList {listaAgrupada} />
</div>

<style>
    .page-content {
        display: flex;
        flex-direction: column;
        overflow: auto;
    }
</style>