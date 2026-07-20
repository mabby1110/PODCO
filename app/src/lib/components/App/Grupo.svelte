<script>
	import { page } from '$app/state';
	import { fases, fases_actividad } from '$lib';
	import { agrupacionesStore } from '$lib/stores/agrupacionesStore.svelte';

	let { agrupacion, showByDefault = false, children } = $props();
	let { clientes, agentes, oportunidades } = $state(page.data);
	let categoria = String(agrupacionesStore.filtersByRoute[page.url.pathname]);
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
</script>

<button class="group-header" onclick={() => (show = !show)}>
	<h3 class="dia-header">{groupTitle} ({agrupacion.elementos.length})</h3>
</button>

<hr />
{#if show}
	<div class="group-list">
		{@render children()}
	</div>
{/if}

<style>
	.group-header {
		all: unset;
		padding: var(--a);
		border-radius: var(--a);
	}
	.group-header:hover {
		cursor: pointer;
		opacity: 60%;
		background-color: var(--color-highlight);
	}
	.group-list {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding: var(--a);
	}
</style>
