<script lang="ts">
	import ItemLista from '$lib/components/Tarjetas/ItemLista.svelte';
	import { StorePedidoNuevo } from '$lib/stores/pedidos/StorePedidoNuevo.svelte';

	let { elemento } = $props();
</script>

<ItemLista onclick={() => StorePedidoNuevo.push(elemento.id)}>
	{#snippet header()}
		{elemento.codigo}
	{/snippet}
	{#snippet meta()}
		{elemento.id_agrupacion}
	{/snippet}
</ItemLista>
