<script lang="ts">
	import { enhance } from '$app/forms';
	import Pedido from '$lib/components/Tarjetas/Pedido.svelte';

	let { pedidos }: { pedidos: any[] } = $props();
</script>

<div class="pedido">
	{#each pedidos as item}
		<form method="POST" action="/inventario?/updatePedido" use:enhance class="form-desvincular">
			<input
				type="hidden"
				name="pedidosAActualizar"
				value={JSON.stringify([{ id: item.id, id_oportunidad: null }])}
			/>

			<Pedido {item} />
		</form>
	{/each}
</div>

<style>
	.pedido {
		display: flex;
		flex-direction: column;
		width: 90%;
	}
</style>
