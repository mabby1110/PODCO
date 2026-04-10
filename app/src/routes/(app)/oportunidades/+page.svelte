<script lang="ts">
	import OpList from '$lib/components/Oportunidad/OpList.svelte';
	import { page } from '$app/state';
	import { procesarDatosReactivos } from '$lib/utils/filtro';

	let { oportunidades } = $derived(page.data);
	
	const listaAgrupada = $derived.by(() => procesarDatosReactivos(oportunidades));
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
