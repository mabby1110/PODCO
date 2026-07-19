<script lang="ts">
	import { productosSeleccionadosStore } from '$lib/stores/productosSeleccionadosStore.svelte';
	import ListPreview from '../App/Listas/ListPreview.svelte';
	import ContadorProducto from '../Pedidos/ContadorProducto.svelte';

	let { producto } = $props();

	let esSeleccionado = $derived(
		productosSeleccionadosStore.items.some((p: any) => p.producto.id === producto?.id)
	);

	function handleClick() {
		productosSeleccionadosStore.agregar(producto);
	}
</script>

<ListPreview href="/oportunidades/{producto.id}" style={producto?.style}>
	{#snippet header()}
		<b class="tiny">{producto?.serie || producto?.codigo}</b>
		<p>{producto?.descripcion}</p>
	{/snippet}

	{#snippet meta()}
		<p>{producto?.ubicacion_fisica}</p>
		<p>{producto?.categorias}</p>
	{/snippet}
	{#snippet acciones()}
		{#if esSeleccionado}
			<ContadorProducto {producto} />
		{:else}
			<button class="butter" onclick={handleClick}>+</button>
			<p class="header-meta">
				cantidad: {producto?.cantidad}
			</p>
		{/if}
	{/snippet}
</ListPreview>
