<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { productosSeleccionadosStore } from '$lib/stores/productosSeleccionadosStore.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
	import FormInput from '../FormInput.svelte';

	let id_agente = $state('');
	let id_oportunidad = $derived(page.data.profile);
	let no_orden = $state('');
	let tipo: 'entrada' | 'salida' = $state('entrada');

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
</script>

<div class="movimiento">
	<div class="campos-grupo">
		<div class="header">
			<h3>Confirmación de Movimiento</h3>
			<p>{id_oportunidad.nombre}</p>
		</div>
	</div>

	<h4>Productos en Cola:</h4>
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
				<span>Precio</span>
			</div>
			{#each productosSeleccionadosStore.items as item}
				<div class="producto">
					<span>{item.piezas}</span>
					<span>{item.producto.codigo || '-'}</span>
					<span>{item.producto.descripcion || '-'}</span>
					<span>{item.producto.serie || '-'}</span>
					<span>USD</span>
					<input type="number" bind:value={item.producto.precio} />
				</div>
			{/each}
			<div class="acciones-tabla">
				<button class="butter" type="button" onclick={copiarAExcel}> Copiar Datos </button>
				<button class="butter" type="button" onclick={() => productosSeleccionadosStore.limpiar()}>
					Borrar
				</button>
			</div>
		</div>
	{/if}

	<form
		method="POST"
		action="/kardex?/add"
		use:enhance={({ formData }) => {
			const payload = productosSeleccionadosStore.items.map((item) => ({
				id_producto: item.producto.id,
				id_agente,
				id_oportunidad,
				piezas: item.piezas,
				tipo
			}));

			formData.append('payload', JSON.stringify(payload));

			return async ({ result }) => {
				if (result.type === 'success') {
					productosSeleccionadosStore.limpiar();
					id_agente = '';
					id_oportunidad = '';
				}
			};
		}}
	>
		<input type="text" hidden bind:value={$profile} />
		<div class="acciones">
			<div class="form-group">
				<label>
					<select bind:value={tipo}>
						<option value="" selected disabled>seleccionar acción</option>
						<option value="cotizacion">cotización</option>
						<option value="entrada">Entrada</option>
						<option value="salida">Salida</option>
					</select>
				</label>
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
		</div>
	</form>
</div>

<style>
	.movimiento {
		width: 100%;
		position: sticky;
		top: 0;
		z-index: 99;
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
	.acciones {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
	}
	.campos-grupo {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.5rem;
		margin: var(--a) 0;
	}
	.productos {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding: var(--a);
		max-height: 40vh;
		overflow: auto;
	}
	.acciones-tabla {
		display: flex;
		gap: var(--a);
		margin-top: var(--a);
	}
	.acciones-tabla .butter {
		width: fit-content;
	}
	.producto {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
		gap: var(--a);
		align-items: baseline;
	}
	.producto :last-child {
		grid-column: span 2;
	}
	form {
		display: flex;
		justify-content: space-between;
	}
	.vacio {
		margin: 2rem;
	}
</style>
