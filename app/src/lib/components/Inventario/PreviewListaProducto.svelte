<script lang="ts">
	import { page } from '$app/state';
	import { fases } from '$lib';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { formatDateFull, parseDateTimeLocal } from '$lib/utils/agenda';
	import { getStyleForPhase } from '$lib/utils/util';
	import ListPreview from '../ListPreview.svelte';

	let { event } = $props();
	const { clientes, agentes } = $derived(page.data);

	const eventData = $derived.by(() => {
		if (!event) return null;
		return {
			...event
		};
	});
</script>

<ListPreview href="/oportunidades/{event.id}" style={eventData?.style}>
	{#snippet header()}
		<p class="codigo">{eventData?.codigo}</p>
		<b>{eventData?.descripcion}</b>
	{/snippet}

	{#snippet content()}
		{#if eventData?.descripcion}
			<div class="brief">
				<h3>Descripcion</h3>
				<p>{eventData?.descripcion}</p>
			</div>
		{/if}
	{/snippet}

	{#snippet meta()}
		<p>{eventData?.ubicacion_fisica}</p>
		<p>{eventData?.categorias}</p>
	{/snippet}
</ListPreview>

<style>
	.codigo {
		min-width: 15%;
	}
</style>