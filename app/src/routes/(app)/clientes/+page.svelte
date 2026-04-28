<script lang="ts">
	import { procesarDatosReactivos } from '$lib/utils/filtro';
	import ClientList from '$lib/components/Cliente/ClientList.svelte';
	import ClientesBI from '$lib/components/BI/ClientesBI.svelte';

	let { data } = $props();

	// Derivación atómica para evitar parpadeos
	const listaAgrupada = $derived.by(() => procesarDatosReactivos(data.clientes ?? []));
</script>

<ClientesBI {listaAgrupada} />
<div class="page-content">
	<ClientList {listaAgrupada} />
</div>

<style>
	.page-content {
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
