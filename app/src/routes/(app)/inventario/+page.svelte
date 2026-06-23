<script lang="ts">
	import { page } from '$app/state';
	import ListaInventario from '$lib/components/Inventario/ListaInventario.svelte';
	import { procesarDatosReactivos } from '$lib/utils/filtro.js';

	let { data } = $props();

    let currentRoute = $derived(page.url.pathname);
    
    const listaAgrupada = $derived.by(() => procesarDatosReactivos(data.inventario, currentRoute));
</script>

<div class="page-content">
	<ListaInventario {listaAgrupada} />
</div>

<style>
	.page-content {
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
