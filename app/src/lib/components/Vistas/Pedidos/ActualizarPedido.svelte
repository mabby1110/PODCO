<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import { agruparDatos } from '$lib/utils/filtro';
	import { formatCurrency } from '$lib/utils/util';

	let { pedidos } = $derived(page.data);
	let lista_agrupada = $derived(agruparDatos(pedidos, 'id_agrupacion'));

	let grupoSeleccionado = $state<any>(null);

	function procesarPedidoForm({ formData }) {
		if (!grupoSeleccionado) return;

		const payload = grupoSeleccionado.elementos.map((item: any) => ({
			id: item.id,
			id_oportunidad: page.params.op
		}));

		formData.append('pedidosAActualizar', JSON.stringify(payload));

		return async ({ result, update }) => {
			if (result.type === 'success') {
				await invalidateAll();
				grupoSeleccionado = null;
			}
			await update();
		};
	}
</script>

{#if !grupoSeleccionado}
	<div class="headers">
		<span>Descripción</span>
		<span>Código</span>
		<span>Cantidad</span>
		<span>P/U</span>
		<span>Moneda</span>
		<span>Total</span>
	</div>

	<div class="pedidos">
		{#each lista_agrupada as grupo}
			<div class="panel grupo">
				{#each grupo.elementos as item}
					<div class="pedido">
						<b class="descripcion">{item.inventario?.descripcion || '-'}</b>
						<span class="codigo"
							>{item.inventario?.serie || item.inventario?.codigo || 'sin código'}</span
						>
						<span>{item.cantidad}</span>
						<span><p>${item.precio_unitario || 0}</p></span>
						<span>USD</span>
						<span class="total"
							>{formatCurrency(String(item.precio_unitario * item.cantidad), 'USD')}</span
						>
					</div>
				{/each}
				<div class="acciones-tabla">
					<button class="butter" type="button" onclick={() => (grupoSeleccionado = grupo)}>
						Seleccionar Pedido
					</button>
				</div>
			</div>
		{/each}
	</div>
{:else}
	<div class="detalle-pedido">
		<button class="butter" type="button" onclick={() => (grupoSeleccionado = null)}>
			← Volver a la lista
		</button>

		<div class="panel grupo">
			{#each grupoSeleccionado.elementos as item}
				<div class="pedido">
					<b class="descripcion">{item.inventario?.descripcion || '-'}</b>
					<span class="codigo"
						>{item.inventario?.serie || item.inventario?.codigo || 'sin código'}</span
					>
					<span>{item.cantidad}</span>
					<span><p>${item.precio_unitario || 0}</p></span>
					<span>USD</span>
					<span class="total"
						>{formatCurrency(String(item.precio_unitario * item.cantidad), 'USD')}</span
					>
				</div>
			{/each}
		</div>

		<form method="POST" action="/inventario?/updatePedido" use:enhance={procesarPedidoForm}>
			<button class="butter" type="submit"> Procesar Pedido </button>
		</form>
	</div>
{/if}

<style>
	.pedidos {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
		gap: var(--a);
		padding: var(--a);
	}
	.detalle-pedido {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding: var(--a);
	}
	.grupo {
		grid-column: span 6;
		background-color: var(--color-foreground);
		display: flex;
		flex-direction: column;
		padding: 4px;
	}
	.pedido {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(35px, 1fr));
		gap: var(--a);
		align-items: baseline;
		padding: 4px;
		justify-items: center;
	}
	.pedido .descripcion {
		grid-column: span 6;
		word-break: break-all;
		justify-self: flex-start;
	}
	.pedido .codigo {
		grid-column: span 3;
		word-break: break-all;
		justify-self: flex-start;
	}
	.pedido .total {
		grid-column: span 2;
		word-break: break-all;
	}
	.acciones-tabla {
		display: flex;
		gap: var(--a);
		margin-top: 10px;
	}
	.headers {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		padding: var(--a);
	}
</style>
