<script lang="ts">
	import { page } from '$app/state';
	import { fases } from '$lib';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { selectedActivity } from '$lib/stores/selectedActivity';
	import { getStyleForPhase } from '$lib/utils/util';

	let { event } = $props();
	const { agentes } = $derived(page.data);

	const eventData = $derived.by(() => {
		if (!event) return null;

		return {
			agente: agentes?.find((e: { id: any }) => e.id == event.id_agente) ?? $profile,
			fase: fases.find((f) => f.id_fase == event.fase),
			motivo: event?.motivo,
			inicio: event?.inicio,
			historia: event.historia,
			requisitos: event.requisitos,
			objetivo: event.objetivo,
			style: getStyleForPhase(event.fase)
		};
	});

	function select() {
		console.log('selected', event);
		// Crear una copia del evento para evitar problemas de referencia
		selectedActivity.set({ ...event });
	}
</script>

<a href="/actividades/{event.id}" class="card-list-preview" style={eventData?.style}>
	<p class="date">{eventData?.inicio}</p>
	<div class="title">
		<h3>{eventData?.motivo}</h3>
	</div>
	{#if eventData?.objetivo}
		<div class="brief">
			<b>Objetivo</b>
			<p>{eventData?.objetivo}</p>
		</div>
	{/if}
	{#if eventData?.historia}
		<div class="brief">
			<b>Historia</b>
			<p>{eventData?.historia}</p>
		</div>
	{/if}

	<div class="meta">
		<p>{eventData?.agente?.nombre}, fase: {eventData?.fase?.actual}</p>
	</div>
</a>

<style>
	.title {
		min-width: 60%;
	}
	.brief {
		flex-grow: 1;
		width: 100%;
	}
	.meta {
		min-width: 60%;
		flex-grow: 1;
	}
	.date {
		position: absolute;
		top: 4px;
		right: var(--a);
	}
</style>
