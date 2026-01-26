<script lang="ts">
	import { page } from '$app/state';
	import { fases } from '$lib';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { selectedEvent } from '$lib/stores/selectedEvent';
	import { getStyleForPhase } from '$lib/utils/util';

	let { event } = $props();

	const { clientes, agentes } = $derived(page.data);
	const eventData = $derived.by(() => {
		if (!event) return null;

		return {
			razon_social: clientes[event.id_cliente]?.razon_social ?? '',
			agente: agentes?.find((e) => e.id == event.id_agente) ?? $profile,
			motivo: event?.motivo,
			inicio: event?.inicio,
			fase:fases[event.fase - 1],
			historia: event.historia || 'Sin historial registrado',
			cotizaciones: event.cotizaciones || 'No hay cotizaciones',
			documentos: event.documentos || 'Sin documentos',
			style: getStyleForPhase(event.fase)
		};
	});
		
	function select() {
		console.log('selected', event);
		// Crear una copia del evento para evitar problemas de referencia
		selectedEvent.set({ ...event });
	}
</script>

<button class="card" style={eventData?.style} onclick={select}>
	<p class="date">{eventData?.inicio}</p>
	<div class="title">
		<h3>{eventData?.motivo}</h3>
	</div>

	<div class="brief">
		<p>{eventData?.razon_social}</p>
	</div>

	<div class="meta">
		<p>{eventData?.agente.nombre}, fase: {eventData?.fase?.actual}</p>
	</div>
</button>

<style>
	.card {
		position: relative;
		padding: var(--a);
		backdrop-filter: blur(16px);
		width: 100%;
		min-height: var(--e);
		display: flex;
		gap: var(--a);
		flex-wrap: wrap;
		align-items: center;
		text-align: left;
		border-style: none;
		border-width: 0;
		border-radius: var(--a);
		
		box-shadow: 0 8px 6px rgba(0, 0, 0, 0.2);
	}
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
		font-size: smaller;
	}
</style>
