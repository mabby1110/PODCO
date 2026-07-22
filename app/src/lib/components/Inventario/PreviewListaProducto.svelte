<script lang="ts">
	import { StorePedidoNuevo } from '$lib/stores/StorePedidoNuevo.svelte';
	import ListPreview from '../App/Listas/ListPreview.svelte';
	import ContadorProducto from '../Pedidos/ContadorProducto.svelte';

	let { producto } = $props();

	let esSeleccionado = $derived(
		StorePedidoNuevo.items.some((p: any) => p.producto.id === producto?.id)
	);

	function handleClick() {
		StorePedidoNuevo.agregar(producto);
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
		<ContadorProducto {producto} />
	{/snippet}
</ListPreview>
