<script lang="ts">
	import ListPreview from '../Listas/ListPreview.svelte';
	import ContadorProducto from '../Pedidos/ContadorProducto.svelte';

	let { producto } = $props();
</script>

<ListPreview href="/oportunidades/{producto.id}" style={producto?.style}>
	{#snippet header()}
		<p>{producto?.descripcion}</p>
		<p>{producto?.serie || producto?.codigo}</p>
	{/snippet}
	{#snippet meta()}
		<p>{producto?.ubicacion_fisica}</p>
		<p>{producto?.categorias}</p>
	{/snippet}
	{#snippet acciones()}
		<ContadorProducto {producto} />
	{/snippet}
</ListPreview>
