<script lang="ts">
	import Pedido from '$lib/components/Tarjetas/Pedido.svelte';
	import { StorePedido } from '$lib/stores/StorePedido.svelte';
	import { appState } from '$lib/stores/appState.svelte';
	import { goto } from '$app/navigation';

	let {
		pedidos,
		editando = false,
	}: { pedidos: any[]; oportunidad?: any; editando?: boolean; currentFase?: number } = $props();
	$effect(() => console.log(pedidos));
	function editarPedidoSeleccionado() {
		StorePedido.limpiar();
		pedidos.forEach((item) => {
			StorePedido.agregar(item);
		});
		appState.setEditarPedido(true);
		goto('/inventario');
	}
</script>

<div class="pedido">
	<div class="panel grupo">
		{#if editando}
			<button class="butter" onclick={editarPedidoSeleccionado}>Editar</button>
		{/if}
		{#each pedidos as item}
			<Pedido {item} {editando} hot />
		{/each}
	</div>
</div>

<style>
	.pedido {
		display: flex;
		flex-direction: column;
		width: 90%;
	}
</style>
