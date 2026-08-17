<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { StorePedidoNuevo } from '$lib/stores/StorePedidoNuevo.svelte';
	import { StorePedido } from '$lib/stores/StorePedido.svelte';
	import FormSelectAgente from '$lib/components/Formularios/FormSelectAgente.svelte';
	import TarjetaPedido from '$lib/components/Vistas/Pedidos/TarjetaPedido.svelte';
	import TarjetaPedidoNuevo from './TarjetaPedidoNuevo.svelte';

	let { id_oportunidad }: { id_oportunidad?: string } = $props();
	const copiarAExcel = () => {
		const cabeceras = 'Cantidad\tDescripción\tSerie\tMoneda\tPrecio';
		const filas = StorePedidoNuevo.items
			.map(
				(item) =>
					`${item.piezas}\t${item.producto.descripcion || ''}\t${item.producto.serie || ''}\tUSD\t${item.producto.precio || 0}`
			)
			.join('\n');

		navigator.clipboard.writeText(`${cabeceras}\n${filas}`);
	};

	let selectedItem: any = $state(null);
	let id_agente = $state('');
	$effect(() => {
		if (selectedItem) {
			selectedItem.stock = true;
			StorePedidoNuevo.agregar(selectedItem);
			selectedItem = null;
		}
	});
</script>

<div class="headers">
	<span>Descripción</span>
	<span>Código</span>
	<span>Stock</span>
	<span>Cantidad</span>
	<span>P/U</span>
	<span>Moneda</span>
	<span>Total</span>
</div>
<div class="movimiento">
	{#if StorePedidoNuevo.items.length === 0 && StorePedido.items.length === 0}
		<p class="vacio">No hay productos seleccionados.</p>
	{:else}
		{#if StorePedido.items.length !== 0}
			<div class="productos">
				{#each StorePedido.items as item}
					{#if !item.pedido?.id_cotizacion}
						<TarjetaPedido bind:item={item.pedido} editando={true} hot={true} />
					{/if}
				{/each}
				<div class="acciones-tabla">
					<button class="butter" type="button" onclick={copiarAExcel}> Copiar Datos </button>
					<button class="butter" type="button" onclick={() => StorePedido.limpiar()}>
						Limpiar
					</button>
				</div>
			</div>
		{/if}

		{#if StorePedidoNuevo.items.length !== 0}
			<h3>{StorePedido.items.length > 0 ? 'Agregar a' : 'Nuevo'} Pedido</h3>
			<div class="productos">
				{#each StorePedidoNuevo.items as _, i}
					<TarjetaPedidoNuevo bind:item={StorePedidoNuevo.items[i]} />
				{/each}
				<div class="acciones-tabla">
					<button class="butter" type="button" onclick={() => StorePedidoNuevo.limpiar()}>
						Limpiar
					</button>
				</div>
			</div>
		{/if}
	{/if}

	<form
		method="POST"
		action="/pedidos?/updatePedido"
		use:enhance={({ formData }) => {
			let id_agrupacion_base = null;
			let id_oportunidad_base = null;

			if (StorePedido.items.length > 0) {
				id_agrupacion_base = StorePedido.items[0].pedido.id_agrupacion;
				id_oportunidad_base = StorePedido.items[0].pedido.id_oportunidad;

				const pedidosAActualizar = StorePedido.items.map((item) => ({
					id: item.pedido.id,
					id_agente,
					id_producto: item.pedido.inventario.id,
					id_oportunidad: item.pedido.id_oportunidad,
					cantidad: item.pedido.cantidad,
					precio_unitario: item.pedido.precio_unitario,
					stock: item.pedido.stock,
					estatus: item.pedido.estatus
				}));

				formData.append('pedidosAActualizar', JSON.stringify(pedidosAActualizar));
			}

			if (StorePedidoNuevo.items.length > 0) {
				const nuevoPedido = StorePedidoNuevo.items.map((item) => ({
					id_producto: item.producto.id,
					id_agente,
					id_oportunidad: id_oportunidad_base || id_oportunidad || null,
					cantidad: item.piezas,
					precio_unitario: item.producto.precio,
					stock: item.stock,
					estatus: id_oportunidad_base ? 'seleccionado' : 'borrador',
					...(id_agrupacion_base && { id_agrupacion: id_agrupacion_base })
				}));

				formData.append('pedidosACrear', JSON.stringify(nuevoPedido));
			}
			if (id_oportunidad_base) {
				goto(`/oportunidades/${id_oportunidad_base}`);
			} else {
				goto('/pedidos');
			}
			return async ({ result }) => {
				if (result.type === 'success') {
					StorePedido.limpiar();
					StorePedidoNuevo.limpiar();
					invalidateAll();
				}
			};
		}}
	>
		<div class="acciones">
			<FormSelectAgente bind:selected={id_agente} />
			<button
				class="butter submit matcha"
				type="submit"
				disabled={StorePedidoNuevo.items.length === 0 && StorePedido.items.length === 0}
			>
				Guardar
			</button>
		</div>
	</form>
</div>

<style>
	.movimiento {
		position: sticky;
		top: 0;
		display: flex;
		flex-direction: column;
		gap: var(--a);
		width: 100%;
		overflow: auto;
		padding: var(--a);
		pointer-events: none;
	}
	button {
		pointer-events: all;
		cursor: pointer;
	}
	.acciones {
		display: flex;
		justify-content: flex-end;
		width: 100%;
		gap: var(--a);
		pointer-events: all;
	}
	.productos {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding: var(--a);
		border-radius: var(--a);
		background-color: var(--color-foreground);
	}
	.acciones-tabla {
		display: flex;
		gap: var(--a);
		position: sticky;
		bottom: 0;
	}
	.acciones-tabla .butter {
		width: fit-content;
	}
	.submit {
		width: fit-content;
		align-self: flex-end;
	}
	.vacio {
		margin: 2rem;
	}
	.headers {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		padding: var(--a);
	}
</style>
