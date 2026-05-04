<script lang="ts">
	import OpList from '$lib/components/Oportunidad/OpList.svelte';
	import { page } from '$app/state';
	import { procesarDatosReactivos } from '$lib/utils/filtro.js';

	let { data } = $props();

    let currentRoute = $derived(page.url.pathname);
    
    const listaAgrupada = $derived.by(() => procesarDatosReactivos(data.oportunidades, currentRoute));
</script>

<div class="page-content">
	<OpList {listaAgrupada} />
</div>

<style>
	.page-content {
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
