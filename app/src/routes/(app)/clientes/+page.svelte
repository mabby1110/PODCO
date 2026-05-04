<script lang="ts">
	import { procesarDatosReactivos } from '$lib/utils/filtro';
	import ClientList from '$lib/components/Cliente/ClientList.svelte';
	import ClientesBI from '$lib/components/BI/ClientesBI.svelte';
	import { page } from '$app/state';

	let { data } = $props();

    let currentRoute = $derived(page.url.pathname);
    
    const listaAgrupada = $derived.by(() => procesarDatosReactivos(data.clientes, currentRoute));
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
