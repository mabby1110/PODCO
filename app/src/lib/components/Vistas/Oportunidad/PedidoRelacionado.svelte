<script lang="ts">
	import { enhance } from '$app/forms';
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

			<div class="entrada">
				<div class="descripcion">
					<b>{pedido.inventario?.descripcion || '-'}</b>
				</div>

				<span class="codigo">{pedido.inventario?.codigo || 'sin código'}</span>

				<span>{pedido.cantidad}</span>

				<span>
					<p>${pedido.precio_unitario || 0}</p>
				</span>

				<span>USD</span>

				<span class="total">
					{formatCurrency(String(pedido.precio_unitario * pedido.cantidad), 'USD')}
				</span>
				<button type="submit" class="butter chile" title="Desvincular">✕</button>
			</div>
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
		padding: var(--a);
	}

	.entrada .descripcion {
		grid-column: span 5;
		word-break: break-all;
		justify-self: flex-start;
		display: flex;
		flex-direction: column;
	}

	.entrada .codigo {
		grid-column: span 2;
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
