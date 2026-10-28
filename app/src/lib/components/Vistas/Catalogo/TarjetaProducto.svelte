<script lang="ts">
	import ItemLista from '$lib/components/Tarjetas/ItemLista.svelte';
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';
	import { StorePedidoNuevo } from '$lib/stores/pedidos/StorePedidoNuevo.svelte';

	let { elemento } = $props();

	// Inventario general (sin serie) del producto
	let inventario = $derived(
		elemento.inventario?.find((i) => i.id_producto === elemento.id) ?? elemento.inventario?.[0]
	);

	// Unidades con número de serie
	let serializados = $derived(elemento?.serializados ?? []);

	// Total = cantidad en inventario + unidades serializadas
	let cantidadTotal = $derived((inventario?.cantidad ?? 0) + serializados.length);
</script>

<ItemLista
	onclick={() => {
		if (!StorePedidoEditar.modal) return false;
		StorePedidoNuevo.push(elemento.id);
	}}
>
	{#snippet titulo()}
		<h3>
			{elemento.codigo}
		</h3>
		<p>{elemento.descripcion}</p>
	{/snippet}
	{#snippet contenido()}
		{#if elemento.tipo_producto.es_serializado}
			{#each serializados as unico}
				<div class="producto-meta">
					<p>{unico.serie}</p>
					<p>{unico.estado}</p>
				</div>
			{/each}
		{/if}
	{/snippet}
	{#snippet acciones()}
		<p><span>cantidad: </span> {cantidadTotal}</p>
	{/snippet}
	{#snippet meta()}
		<p>{elemento.tipo_producto.nombre}</p>
	{/snippet}
</ItemLista>

<style>
	.producto-meta {
		display: flex;
		gap: var(--a);
	}
</style>
