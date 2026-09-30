<script lang="ts">
	import ItemLista from '$lib/components/Tarjetas/ItemLista.svelte';
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';
	import { StorePedidoNuevo } from '$lib/stores/pedidos/StorePedidoNuevo.svelte';

	let { elemento } = $props();
	let inventario = $derived(elemento.inventario[0]);
	function agregarProducto(e) {
		e.stopPropagation();
		StorePedidoEditar.toggleModal(true);
		StorePedidoNuevo.push(elemento.id);
	}
</script>

<ItemLista onclick={(e) => agregarProducto(e)}>
	{#snippet titulo()}
		<h3>
			{elemento.codigo}
		</h3>
	{/snippet}
	{#snippet contenido()}
		{elemento.descripcion}
	{/snippet}
	{#snippet acciones()}
		<p><span>cantidad: </span> {inventario.cantidad}</p>
	{/snippet}
	{#snippet meta()}
		<p>{elemento.tipo_producto.nombre}</p>
	{/snippet}
</ItemLista>
