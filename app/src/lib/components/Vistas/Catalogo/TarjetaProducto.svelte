<script lang="ts">
	import ItemLista from '$lib/components/Tarjetas/ItemLista.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';
	import { StorePedidoNuevo } from '$lib/stores/pedidos/StorePedidoNuevo.svelte';

	let { elemento } = $props();
	function agregarProducto(e) {
		e.stopPropagation();
		StorePedidoEditar.toggleModal(true);
		StorePedidoNuevo.push(elemento.id);
	}
</script>

<ItemLista>
	{#snippet titulo()}
		<h3>
			{elemento.codigo}
		</h3>
	{/snippet}
	{#snippet contenido()}
		detalles
	{/snippet}
	{#snippet acciones()}
		<button class="butter" onclick={(e) => agregarProducto(e)}>+</button>
	{/snippet}
	{#snippet meta()}
		{elemento.id}
	{/snippet}
</ItemLista>
