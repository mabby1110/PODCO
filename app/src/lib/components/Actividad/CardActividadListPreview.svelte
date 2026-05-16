<script lang="ts">
	import { page } from '$app/state';
	import { fases } from '$lib';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { getStyleForPhase } from '$lib/utils/util';

	let { event } = $props();
	const { agentes } = $derived(page.data);

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

<a href="/actividades/{event.id}" class="card-list-preview" style={eventData?.style}>
	<div class="title">
		<h3>{eventData?.motivo}</h3>
	</div>
	{#if eventData?.objetivo}
		<div class="brief">
			<b>Objetivo</b>
			<p>{eventData?.objetivo}</p>
		</div>
	{/if}
	<div class="meta">
		<p class="id">{eventData?.id}</p>
		<p>{eventData?.agente?.nombre}</p>
		<p>{eventData?.inicio}</p>
	</div>
</a>
