<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { StoreEditarPedido } from '$lib/stores/StoreEditarPedido.svelte';
	import { agruparDatos } from '$lib/utils/filtro';
	import { formatCurrency } from '$lib/utils/util';
	import { goto } from '$app/navigation';
	import Pedido from '$lib/components/Tarjetas/Pedido.svelte';
	import FormSelectAgente from '$lib/components/Formularios/FormSelectAgente.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';

	// Recibe el parámetro de la página actual
	let { id_oportunidad }: { id_oportunidad: string } = $props();

	let { pedidos, agentes } = $derived(page.data);
	let agrupacion = $state('id_agrupacion');
	let lista_agrupada = $derived(agruparDatos(pedidos, agrupacion));

	function seleccionarAgrupacion(elementos: any[]) {
		StoreEditarPedido.limpiar();
		elementos.forEach((item) => {
			StoreEditarPedido.agregar(item);
		});
	}
	let agente = $state(null);
	$effect(() => console.log(StoreEditarPedido.items));
</script>

<button class="butter" onclick={() => goto('/inventario')}>+Pedido nuevo</button>
<div class="pedidos">
	{#if StoreEditarPedido.items.length === 0}
		{#each lista_agrupada as grupo}
			<button class="panel grupo" onclick={() => seleccionarAgrupacion(grupo.elementos)}>
				{#each grupo.elementos as item}
					<Pedido {item} selected />
				{/each}
			</button>
		{/each}
	{:else}
		<div class="panel grupo">
			{#each StoreEditarPedido.items as item}
				<Pedido {item} />
			{/each}
		</div>
		<form
			method="POST"
			action="/inventario?/updatePedido"
			class="form-acciones"
			use:enhance={({ formData }) => {
				if (StoreEditarPedido.items.length > 0) {
					const pedidosAActualizar = StoreEditarPedido.items.map((item) => ({
						id: item.id,
						id_oportunidad: id_oportunidad,
						id_agente: agente
					}));

					formData.append('pedidosAActualizar', JSON.stringify(pedidosAActualizar));
				}
			}}
		>
			{#if $profile?.isAdmin}
				<label>
					<select name="id_agente" class="butter" bind:value={agente} required>
						<option value="" disabled selected>Selecciona un agente</option>
						{#each agentes as agente}
							<option value={String(agente.id)}>
								{agente.nombre}
							</option>
						{/each}
					</select>
				</label>
			{:else}
				<input type="hidden" name="id_agente" value={$profile?.id} />
			{/if}
			<button class="butter chile" type="button" onclick={() => StoreEditarPedido.limpiar()}
				>Cancelar</button
			>
			<button class="butter matcha" type="submit">Relacionar Pedido</button>
		</form>
	{/if}
</div>

<style>
	.pedidos {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding: var(--a);
		max-height: 60vh;
		height: fit-content;
		overflow: auto;
		width: 100%;
	}
	.grupo {
		grid-column: span 6;
		background-color: var(--color-foreground);
		display: flex;
		flex-direction: column;
		cursor: pointer;
	}
	.form-acciones {
		display: flex;
		gap: var(--a);
		padding: var(--a);
		justify-content: flex-end;
	}
</style>
