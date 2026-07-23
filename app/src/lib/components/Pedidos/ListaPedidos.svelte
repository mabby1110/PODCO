<script lang="ts">
	import { page } from '$app/state';
	import { StorePedido } from '$lib/stores/StorePedido.svelte';
	import { StorePedidoNuevo } from '$lib/stores/StorePedidoNuevo.svelte';
	import { agruparDatos } from '$lib/utils/filtro';
	import { formatCurrency } from '$lib/utils/util';

	let { view = $bindable() }: { view?: boolean } = $props();
	let { pedidos } = $derived(page.data);
	let lista = $derived(pedidos);
	let agrupacion = $state('id_agrupacion');
	let lista_agrupada = $derived(agruparDatos(lista, agrupacion));
	function handleEdit(elementos: any[]) {
		view = false;
		StorePedido.limpiar();

		elementos.forEach((item) => {
			if (item.id_agrupacion) {
				// si el pedido ya pertenece a una agrupacion solo agregar para editar
				StorePedido.agregar(item);
			} else {
				// es un articulo nuevo
				const cantidad = item.inventario.cantidad || 1;
				for (let i = 0; i < cantidad; i++) {
					StorePedidoNuevo.agregar(item.inventario);
				}
			}
		});
	}

	const copiarAExcel = (elementos: any[]) => {
		const cabeceras = 'Cantidad\tCódigo\tDescripción\tSerie\tMoneda\tPrecio';
		const filas = elementos
			.map(
				(item) =>
					`${item.inventario.cantidad || 0}\t${item.inventario.codigo || ''}\t${item.inventario.descripcion || ''}\t${item.inventario.serie || ''}\tUSD\t${item.inventario.precio || 0}`
			)
			.join('\n');

		navigator.clipboard.writeText(`${cabeceras}\n${filas}`);
	};
</script>

<div class="headers">
	<span>Descripción</span>
	<span>Código</span>
	<span>Cantidad</span>
	<span>P/U</span>
	<span>Moneda</span>
	<span>total</span>
</div>
<div class="pedidos">
	{#each lista_agrupada as grupo}
		<div class="panel grupo">
			{#each grupo.elementos as item}
				<div class="pedido">
					<b class="descripcion">{item.inventario.descripcion || '-'}</b>
					<span class="codigo">
						{item.inventario.serie || item.inventario.codigo || 'sin código'}
					</span>
					<span>
						{item.cantidad}
					</span>
					<span>
						<p>${item.precio_unitario||0}</p>
					</span>
					<span>USD</span>
					<span class="total">
						{formatCurrency(String(item.precio_unitario * item.cantidad), 'USD')}
					</span>
				</div>
			{/each}
			<div class="acciones-tabla">
				<button class="butter" type="button" onclick={() => copiarAExcel(grupo.elementos)}>
					Copiar Datos
				</button>
				<button class="butter" type="button" onclick={() => handleEdit(grupo.elementos)}>
					Editar
				</button>
			</div>
		</div>
	{/each}
</div>

<style>
	.pedidos {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
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
	}
	.headers {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		padding: var(--a);
	}
</style>
