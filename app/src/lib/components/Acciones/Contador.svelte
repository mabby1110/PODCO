<script lang="ts">
	import { StorePedidoNuevo } from '$lib/stores/pedidos/StorePedidoNuevo.svelte';

	let { id }: { id: string } = $props();

	const cantidad = $derived(StorePedidoNuevo.carrito.find((item) => item.id === id)?.cantidad ?? 0);
</script>

<div class="contador">
	{#if cantidad > 0}
		<button class="butter accion" type="button" onclick={() => StorePedidoNuevo.pop(id)}>
			{cantidad > 1 ? '-' : 'x'}
		</button>
		<span>{cantidad}</span>
	{/if}

	<button class="butter accion" type="button" onclick={() => StorePedidoNuevo.push(id)}>+</button>
</div>

<style>
	.contador {
		display: flex;
		align-items: center;
		gap: var(--a);
	}
</style>
