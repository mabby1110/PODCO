<script lang="ts">
	import { page } from '$app/state';
	import { fases } from '$lib';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { getStyleForPhase } from '$lib/utils/util';
	import ListPreview from '../ListPreview.svelte';

	let { event } = $props();
	const { agentes } = $derived(page.data);

	console.log(event.id);
	const eventData = $derived.by(() => {
		if (!event) return null;

		return {
			id: event.id,
			agente: agentes?.find((e: { id: any }) => e.id == event.id_agente) ?? $profile,
			fase: fases.find((f) => f.id_fase == event.fase),
			motivo: event?.motivo,
			inicio: event?.inicio.split(' ')[0],
			historia: event.historia,
			requisitos: event.requisitos,
			objetivo: event.objetivo,
			style: getStyleForPhase(event.fase)
		};
	});
</script>

<ListPreview href="/actividades/{event.id}" style={eventData?.style}>
	{#snippet header()}
		<h2>{eventData?.motivo}</h2>
	{/snippet}

	{#snippet resume()}
		{#if eventData?.objetivo}
			<div class="brief">
				<b>Objetivo</b>
				<p>{eventData?.objetivo}</p>
			</div>
		{/if}
	{/snippet}

	{#snippet meta()}
		<p class="id">{eventData?.id}</p>
		<p>{eventData?.agente?.nombre}</p>
		<p>{eventData?.inicio}</p>
	{/snippet}
</ListPreview>
