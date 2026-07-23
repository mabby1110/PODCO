<script>
	import { page } from '$app/state';
	import { fases, fases_actividad } from '$lib';
	import { appState } from '$lib/stores/appState.svelte';
	import { StoreAgrupaciones } from '$lib/stores/StoreAgrupaciones.svelte';
	import { tick } from 'svelte';

	let { agrupacion, showByDefault = false, children } = $props();
	let { clientes, agentes, oportunidades } = $state(page.data);
	let categoria = String(StoreAgrupaciones.filtersByRoute[page.url.pathname]);
	let show = $derived(showByDefault);
	let groupTitle = $derived(agrupacion.grupo);

	if (categoria == 'fase') {
		switch (page.url.pathname) {
			case '/actividades':
				groupTitle = fases_actividad.find((i) => i.id_fase == agrupacion.grupo)?.actual;
				break;
			case '/oportunidades':
				groupTitle = fases.find((i) => i.id_fase == agrupacion.grupo)?.actual;
				break;
			default:
				break;
		}
	} else if (categoria == 'id_cliente') {
		let cliente = clientes.find((c) => c.id == agrupacion.grupo);
		groupTitle = cliente.nombre_comercial || cliente.razon_social;
	} else if (categoria == 'id_agente') {
		let agente = agentes.find((c) => c.id == agrupacion.grupo);
		groupTitle = agente.nombre;
	} else if (categoria == 'id_oportunidad') {
		let oportunidad = oportunidades.find((c) => c.id == agrupacion.grupo);
		let cliente = clientes.find((c) => c.id == oportunidad.id_cliente);
		groupTitle = (cliente.nombre_comercial || cliente.razon_social) + ' ' + oportunidad.motivo;
	} else {
		groupTitle = agrupacion.grupo;
	}
	let listRef = $state();

	async function handleToggle() {
		appState.toggleMin();
		await tick();

		if (listRef) {
			listRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}
</script>

<div class="group-container">
	<button class="group-header" onclick={handleToggle}>
		<p class="dia-header">{groupTitle} ({agrupacion.elementos.length})</p>
	</button>

	{#if show}
		<div class="group-list" bind:this={listRef}>
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.group-header {
		all: unset;
		padding: var(--a);
		border-radius: var(--a);
		z-index: 9;
		background-color: white;
		width: fit-content;
		position: sticky;
		top: 0;
	}
	.group-header:hover {
		cursor: pointer;
		background-color: white;
	}
	.group-list {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding: var(--a);
	}
</style>
