<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { productosSeleccionadosStore } from '$lib/stores/productosSeleccionadosStore.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
	import FormInput from '../FormInput.svelte';
	import ContadorProducto from './ContadorProducto.svelte';
	import Select from '../Select.svelte';

	let { id_oportunidad }: { id_oportunidad?: string } = $props();

	let no_orden = $state('');
	let tipo = $state('');

	const copiarAExcel = () => {
		const cabeceras = 'Cantidad\tCódigo\tDescripción\tSerie\tMoneda\tPrecio';
		const filas = productosSeleccionadosStore.items
			.map(
				(item) =>
					`${item.piezas}\t${item.producto.codigo || ''}\t${item.producto.descripcion || ''}\t${item.producto.serie || ''}\tUSD\t${item.producto.precio || 0}`
			)
			.join('\n');

		navigator.clipboard.writeText(`${cabeceras}\n${filas}`);
	};

	let selectedItem: any = $state(null);
	$effect(() => {
		if (selectedItem) {
			productosSeleccionadosStore.agregar(selectedItem);
			selectedItem = null;
		}
	});
</script>

<div class="movimiento">
	{#if productosSeleccionadosStore.items.length === 0}
		<p class="vacio">No hay productos seleccionados.</p>
	{:else}
		<div class="productos">
			<div class="producto" style="font-weight: bold;">
				<span>Cantidad</span>
				<span>Código</span>
				<span>Descripción</span>
				<span>Serie</span>
				<span>Moneda</span>
				<span>Precio Unitario</span>
				<span>total</span>
			</div>
			{#each productosSeleccionadosStore.items as item}
				<div class="producto">
					<ContadorProducto producto={item.producto} />
					<span>{item.producto.codigo || '-'}</span>
					<span>{item.producto.descripcion || '-'}</span>
					<span>{item.producto.serie || '-'}</span>
					<span>USD</span>
					<input type="number" name="total" bind:value={item.producto.precio} />
					<span>{item.producto.precio * item.piezas}</span>
				</div>
			{/each}
		</div>
		{#if $profile?.isAdmin || $profile?.isOper}
			<form
				method="POST"
				action="/inventario?/crearPedido"
				use:enhance={({ formData }) => {
					const payload = productosSeleccionadosStore.items.map((item) => ({
						id_producto: item.producto.id,
						id_oportunidad: id_oportunidad || null,
						cantidad: item.piezas,
						precio_unitario: item.producto.precio
					}));

					formData.append('payload', JSON.stringify(payload));

					return async ({ result }) => {
						if (result.type === 'success') {
							productosSeleccionadosStore.limpiar();
							invalidateAll();
						}
					};
				}}
			>
				<!-- formulario -->
				<div class="acciones">
					<Select
						bind:selected={tipo}
						title="Tipo de movimiento"
						options={[{ value: 'cotizacion', label: 'Cotización' }]}
					/>
					{#if tipo === 'entrada'}
						<FormInput
							label="Número de Orden BMS"
							name="no_orden"
							placeholder="Serial BMS"
							type="text"
							bind:value={no_orden}
						/>
						<button
							class="butter submit"
							type="submit"
							disabled={productosSeleccionadosStore.items.length === 0}
						>
							Procesar Entrada
						</button>
					{:else if tipo === 'salida'}
						<button
							class="butter submit"
							type="submit"
							disabled={productosSeleccionadosStore.items.length === 0}
						>
							Procesar Salida
						</button>
					{:else if tipo === 'cotizacion'}
						<button
							class="butter submit"
							type="submit"
							disabled={productosSeleccionadosStore.items.length === 0}
						>
							Crear Pedido
						</button>
					{/if}
				</div>
			</form>
		{/if}
	{/if}

	<div class="acciones-tabla">
		<button class="butter" type="button" onclick={copiarAExcel}> Copiar Datos </button>
		<button class="butter" type="button" onclick={() => productosSeleccionadosStore.limpiar()}>
			Borrar
		</button>
	</div>
</div>

<style>
	.movimiento {
		position: sticky;
		top: 0;
		display: flex;
		flex-direction: column;
		gap: var(--a);
		width: 100%;
		max-width: 800px;
	}
	.acciones {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		width: 100%;
		gap: var(--a);
	}
	.productos {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding: var(--a);
		max-height: 30vh;
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
		grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
		gap: var(--a);
		align-items: baseline;
	}
	.producto :nth-child(2),
	.producto :nth-child(3) {
		grid-column: span 2;
		word-break: break-all;
	}
	.vacio {
		margin: 2rem;
	}
</style>
