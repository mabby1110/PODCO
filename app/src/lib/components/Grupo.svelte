<script>
	import { page } from '$app/state';
	import { fases } from '$lib';
	import { agrupacionesStore } from '$lib/stores/AgrupacionesStore.svelte';

	let { agrupacion, showByDefault = false, children } = $props();
	let { clientes } = $derived(page.data);
	let categoria = String(agrupacionesStore.filtersByRoute[page.url.pathname]);
	let show = $derived(showByDefault);
	let groupTitle = agrupacion.grupo;

	console.log(agrupacion, agrupacionesStore.filtersByRoute[page.url.pathname]);
	if (categoria == 'fase') {
		groupTitle = fases.find((i) => i.id_fase == agrupacion.grupo)?.actual;
	} else if (categoria == 'id_cliente') {
		let cliente = clientes.find((c)=>c.id == agrupacion.grupo);
		console.log(cliente);
		groupTitle = cliente.nombre_comercial || cliente.razon_social;
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
