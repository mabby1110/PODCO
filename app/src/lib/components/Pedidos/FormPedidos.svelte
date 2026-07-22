<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { StorePedidoNuevo } from '$lib/stores/StorePedidoNuevo.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
	import Select from '../App/Select.svelte';
	import ContadorProducto from './ContadorProducto.svelte';
	import { formatCurrency } from '$lib/utils/util';
	import { StorePedido } from '$lib/stores/StorePedido.svelte';
	import EditarCantidadPedido from './EditarCantidadPedido.svelte';

	let { id_oportunidad, view = $bindable() }: { id_oportunidad?: string; view: boolean } = $props();

	let tipo = $state('');
	let movimientos = [
		{ value: 'borrador', label: 'Borrador' },
		{ value: 'cotizacion', label: 'Cotización' }
	];

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
	$effect(() => {
		if (selectedItem) {
			selectedItem.stock = true;
			StorePedidoNuevo.agregar(selectedItem);
			selectedItem = null;
		}
	});
</script>

<div class="movimiento">
	{#if StorePedidoNuevo.items.length === 0 && StorePedido.items.length === 0}
		<p class="vacio">No hay productos seleccionados.</p>
	{:else}
		<div class="producto" style="font-weight: bold;">
			<span class="descripcion">Descripción</span>
			<span class="codigo">Código</span>
			<span>Moneda</span>
			<span class="cantidad">P/U</span>
			<span>Stock</span>
			<span class="cantidad">Cantidad</span>
			<span class="total">Total</span>
		</div>
		{#if StorePedido.items.length !== 0}
			<div class="productos">
				<h3>ID: {StorePedido.items[0].pedido.id_agrupacion}</h3>
				{#each StorePedido.items as item}
					<div class="producto">
						<span class="descripcion">{item.pedido.inventario.descripcion || '-'}</span>
						<span class="codigo"
							>{item.pedido.inventario.serie || item.pedido.inventario.codigo || 'sin código'}</span
						>
						<span>USD</span>
						<span class="cantidad">
							<input type="number" name="total" bind:value={item.pedido.precio_unitario} />
						</span>
						<span>
							<input type="checkbox" disabled checked={item.pedido.stock} />
						</span>
						<span class="cantidad">
							<EditarCantidadPedido pedido={item.pedido} />
						</span>
						<span class="total"
							>{formatCurrency(
								String(item.pedido.precio_unitario * item.pedido.cantidad),
								'USD'
							)}</span
						>
					</div>
				{/each}
				<div class="acciones-tabla">
					<button class="butter" type="button" onclick={copiarAExcel}> Copiar Datos </button>
					<button class="butter" type="button" onclick={() => StorePedido.limpiar()}>
						Borrar
					</button>
				</div>
			</div>
		{/if}
		{#if StorePedidoNuevo.items.length !== 0}
			<div class="productos">
				<h3>{StorePedido.items.length > 0 ? 'Agregar a' : 'Nuevo'} Pedido</h3>
				{#each StorePedidoNuevo.items as item}
					{@const cantidadUso =
						StorePedidoNuevo.obtenerCantidad(item.id) + StorePedido.obtenerCantidad(item.id)}
					{@const sinStock = cantidadUso >= item.producto.cantidad}

					<div class="producto">
						<span class="descripcion">{item.producto.descripcion || '-'}</span>
						<span class="codigo">{item.producto.serie || item.producto.codigo || 'sin código'}</span
						>
						<span>USD</span>
						<span class="cantidad">
							<input type="number" name="total" bind:value={item.producto.precio} />
						</span>
						<span>
							<input
								type="checkbox"
								checked={sinStock ? false : item.stock}
								disabled={sinStock}
								onchange={(e) => {
									item.stock = e.currentTarget.checked;
									item.piezas = item.stock ? 0 : 1;
								}}
							/>
						</span>
						<span class="cantidad">
							{#if item.stock}
								<ContadorProducto producto={item.producto} />
							{:else}
								<input type="number" bind:value={item.piezas} min="1" />
							{/if}
						</span>
						<span class="total"
							>{formatCurrency(String(item.producto.precio * item.piezas), 'USD')}</span
						>
					</div>
				{/each}
				<div class="acciones-tabla">
					<button class="butter" type="button" onclick={copiarAExcel}> Copiar Datos </button>
					<button class="butter" type="button" onclick={() => StorePedidoNuevo.limpiar()}>
						Borrar
					</button>
				</div>
			</div>
		{/if}
	{/if}
	{#if $profile?.isAdmin || $profile?.isOper}
		<form
			method="POST"
			action="?/updatePedido"
			use:enhance={({ formData }) => {
				let id_agrupacion_base = null;

				if (StorePedido.items.length > 0) {
					id_agrupacion_base = StorePedido.items[0].pedido.id_agrupacion;

					const pedidosAActualizar = StorePedido.items.map((item) => ({
						id: item.pedido.id,
						id_producto: item.pedido.inventario.id,
						cantidad: item.pedido.cantidad,
						precio_unitario: item.pedido.precio_unitario,
						stock: item.pedido.stock
					}));

					formData.append('pedidosAActualizar', JSON.stringify(pedidosAActualizar));
				}

				if (StorePedidoNuevo.items.length > 0) {
					const nuevoPedido = StorePedidoNuevo.items.map((item) => ({
						id_producto: item.producto.id,
						id_oportunidad: id_oportunidad || null,
						cantidad: item.piezas,
						precio_unitario: item.producto.precio,
						stock: item.stock !== false,
						...(id_agrupacion_base && { id_agrupacion: id_agrupacion_base })
					}));

					formData.append('pedidosACrear', JSON.stringify(nuevoPedido));
				}

				return async ({ result }) => {
					if (result.type === 'success') {
						StorePedido.limpiar();
						StorePedidoNuevo.limpiar();
						view = true;
						invalidateAll();
					}
				};
			}}
		>
			<div class="acciones">
				<Select bind:selected={tipo} title="Tipo de movimiento" options={movimientos} />
				{#if tipo === 'borrador'}
					<button
						class="butter submit"
						type="submit"
						disabled={StorePedidoNuevo.items.length === 0 && StorePedido.items.length === 0}
					>
						Guardar
					</button>
				{:else if tipo === 'salida'}
					<button
						class="butter submit"
						type="submit"
						disabled={StorePedidoNuevo.items.length === 0 && StorePedido.items.length === 0}
					>
						Procesar Salida
					</button>
				{:else if tipo === 'cotizacion'}
					<button
						class="butter submit"
						type="submit"
						disabled={StorePedidoNuevo.items.length === 0 && StorePedido.items.length === 0}
					>
						Crear Pedido
					</button>
				{/if}
			</div>
		</form>
	{/if}
</div>

<style>
	.movimiento {
		position: sticky;
		top: 0;
		display: flex;
		flex-direction: column;
		gap: var(--a);
		width: 100%;
	}
	.acciones {
		display: flex;
		justify-content: space-between;
		width: 100%;
		gap: var(--a);
	}
	.productos {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding: var(--a);
		max-height: 60vh;
		overflow: auto;
		border-radius: var(--a);
		padding: var(--a);
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
	.producto {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(35px, 1fr));
		gap: var(--a);
		align-items: baseline;
		justify-items: center;
	}
	.producto .descripcion {
		grid-column: span 4;
		word-break: break-all;
		justify-self: flex-start;
	}
	.producto .codigo,
	.producto .cantidad,
	.producto .total {
		grid-column: span 2;
		word-break: break-all;
	}
	.vacio {
		margin: 2rem;
	}
	input {
		width: 100%;
	}
</style>
