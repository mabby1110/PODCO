<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { productosSeleccionadosStore } from '$lib/stores/productosSeleccionadosStore.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
	import FiltroAgente from '../FiltroAgente.svelte';

	let id_agente = $state('');
	let id_oportunidad = $derived(page.data.profile);
	let tipo: 'entrada' | 'salida' = $state('entrada');
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
		<p>No hay productos seleccionados.</p>
	{:else}
		<div class="productos">
			{#each productosSeleccionadosStore.items as item}
				<div class="producto">
					<p>
						Cantidad: {item.piezas}
					</p>
					{#if item.producto.codigo}
						<p>
							{item.producto.codigo}
						</p>
					{/if}
					{#if item.producto.descripcion}
						<p>
							{item.producto.descripcion}
						</p>
					{/if}
					{#if item.producto.serie}
						<p>
							Serie: {item.producto.serie}
						</p>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<form
		method="POST"
		action="/kardex?/add"
		use:enhance={({ formData }) => {
			// Construcción del payload estructurado JSONB antes del envío
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
			<button class="butter" type="button" onclick={() => productosSeleccionadosStore.limpiar()}
				>Borrar</button
			>
			<label>
				<select bind:value={tipo}>
					<option value="entrada">Entrada</option>
					<option value="salida">Salida</option>
				</select>
			</label>
		</div>
		<button
			class="butter submit"
			type="submit"
			disabled={productosSeleccionadosStore.items.length === 0}
		>
			Procesar Transmisión a Supabase
		</button>
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
	.producto {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--a);
	}
	.producto :last-child {
		grid-column: span 2;
	}
	form {
		display: flex;
		justify-content: space-between;
	}
</style>
