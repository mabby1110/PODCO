<script lang="ts">
	import { enhance } from '$app/forms';
	import Pedido from '$lib/components/Tarjetas/Pedido.svelte';
	import { formatCurrency } from '$lib/utils/util';

	let { pedidos }: { pedidos: any[] } = $props();
</script>

<div class="pedido">
	{#each pedidos as pedido}
		<form method="POST" action="/inventario?/updatePedido" use:enhance class="form-desvincular">
			<input
				type="hidden"
				name="pedidosAActualizar"
				value={JSON.stringify([{ id: pedido.id, id_oportunidad: null }])}
			/>

			<Pedido item={pedido} selected/>
		</form>
	{/each}
</div>

<style>
	.pedido {
		display: flex;
		flex-direction: column;
		width: 90%;
	}
	.entrada {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(var(--d), 1fr));
		gap: var(--a);
		align-items: baseline;
		justify-items: center;
	}

	.entrada .descripcion {
		grid-column: span 5;
		word-break: break-all;
		justify-self: flex-start;
		display: flex;
		flex-direction: column;
	}

	.entrada .codigo {
		grid-column: span 3;
		word-break: break-all;
		justify-self: flex-start;
	}

	.entrada .total {
		grid-column: span 2;
		word-break: break-all;
	}

	.chile {
		width: fit-content;
		align-self: center;
		justify-self: center;
	}
</style>
