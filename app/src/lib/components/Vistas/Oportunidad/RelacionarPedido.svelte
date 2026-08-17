<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { StoreRelacionarPedido } from '$lib/stores/StoreRelacionarPedido.svelte';
	import { agruparDatos } from '$lib/utils/filtro';
	import { goto } from '$app/navigation';
	import TarjetaPedido from '$lib/components/Vistas/Pedidos/TarjetaPedido.svelte';
	import { StorePedido } from '$lib/stores/StorePedido.svelte';
	import { onMount } from 'svelte';
	import { appState } from '$lib/stores/appState.svelte';

	// Recibe el parámetro de la página actual
	let { id_oportunidad, agente }: { id_oportunidad: string; agente?: any } = $props();

	let { pedidos } = $derived(page.data);
	let agrupacion = $state('id_agrupacion');
	let lista_agrupada = $derived(agruparDatos(pedidos, agrupacion));

	function seleccionarAgrupacion(elementos: any[]) {
		StoreRelacionarPedido.limpiar();

		// Filtramos los elementos válidos aquí mismo
		const elementosValidos = elementos.filter(
			(i) => i.estatus === 1
		);

		elementosValidos.forEach((item) => {
			StoreRelacionarPedido.agregar(item);
		});
	}

	function editarPedidoSeleccionado() {
		StorePedido.limpiar();
		StoreRelacionarPedido.items.forEach((item) => {
			StorePedido.agregar(item);
		});
		appState.setEditarPedido(true);
		StoreRelacionarPedido.limpiar();
		goto('/inventario');
	}

	onMount(() => StoreRelacionarPedido.limpiar());
</script>

{#if StoreRelacionarPedido.items.length === 0}
	<button class="butter" onclick={() => goto('/inventario')}>+Pedido nuevo</button>
{/if}

<p class="agente">Agente: {agente?.nombre}</p>

<div class="pedidos">
	{#if StoreRelacionarPedido.items.length === 0}
		{#each lista_agrupada.filter( (grupo) => grupo.elementos.some((i) => i.estatus === 1) ) as grupo}
			<button class="panel grupo" onclick={() => seleccionarAgrupacion(grupo.elementos)}>
				{#each grupo.elementos.filter((i) => i.estatus === 1) as item}
					<TarjetaPedido {item} />
				{/each}
			</button>
		{/each}
	{:else}
		<div class="panel grupo">
			{#each StoreRelacionarPedido.items as _, i}
				<TarjetaPedido bind:item={StoreRelacionarPedido.items[i]} editando />
			{/each}
		</div>
		<form
			method="POST"
			action="/pedidos?/updatePedido"
			class="form-acciones"
			use:enhance={({ formData }) => {
				if (StoreRelacionarPedido.items.length > 0) {
					const pedidosAActualizar = StoreRelacionarPedido.items.map(
						({ agentes, inventario, oportunidades, ...item }) => ({
							...item,
							id_oportunidad: id_oportunidad,
							estatus: 2,
							id_agente: agente?.id
						})
					);

					formData.append('pedidosAActualizar', JSON.stringify(pedidosAActualizar));
				}
				StoreRelacionarPedido.limpiar();
			}}
		>
			<button class="butter" onclick={editarPedidoSeleccionado}>Editar</button>
			<button class="butter" type="button" onclick={() => StoreRelacionarPedido.limpiar()}>
				Cancelar
			</button>
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
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding: var(--a);
	}
	.form-acciones {
		display: flex;
		gap: var(--a);
		padding: var(--a);
		justify-content: flex-end;
	}
	.agente {
		align-self: center;
	}
</style>
