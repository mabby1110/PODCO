<script lang="ts">
	import { page } from '$app/state';
	import { fases } from '$lib';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { selectedOp } from '$lib/stores/selectedOp';
	import { getStyleForPhase } from '$lib/utils/util';

	let { event } = $props();
	const { clientes, agentes } = $derived(page.data);

	const eventData = $derived.by(() => {
		if (!event) return null;
		return {
			id: event.id,
			razon_social:
				clientes?.find((c: { id: any }) => c.id == event.id_cliente)?.razon_social ?? '',
			agente: agentes?.find((e: { id: any }) => e.id == event.id_agente) ?? $profile,
			fase: fases.find((f) => f.id_fase == event.fase),
			motivo: event?.motivo,
			inicio: event?.inicio,
			fin: event?.fin,
			historia: event.historia,
			requisitos: event.requisitos,
			observaciones: event.observaciones,
			cotizaciones_ganadas: event.cotizaciones_ganadas,
			cotizaciones_presentadas: event.cotizaciones_presentadas,
			oc_cliente: event.oc_cliente,
			documentos_operacion: event.documentos_operacion,
			documentos: event.documentos,
			objetivo: event.objetivo,
			style: getStyleForPhase(event.fase)
		};
	});

	function select() {
		console.log('selected', event);
		// Crear una copia del evento para evitar problemas de referencia
		selectedOp.set({ ...event });
	}
</script>

<button class="card" style={eventData?.style} onclick={select}>
	<p class="date">{eventData?.inicio}</p>
	<div class="title">
		<h3>{eventData?.motivo}</h3>
		<p>{eventData?.razon_social}</p>
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
</button>

<style>
	.card {
		position: relative;
		padding: var(--a);
		margin: var();
		backdrop-filter: blur(16px);
		width: 100%;
		display: flex;
		gap: var(--b);
		flex-wrap: wrap;
		align-items: center;
		text-align: left;
		border-style: none;
		border-width: 0;
		border-radius: var(--a);
		box-shadow: 0 8px 6px rgba(0, 0, 0, 0.2);
	}
	.card:hover {
		cursor: pointer;
	}
	.title {
		min-width: 60%;
	}
	.brief {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		flex-grow: 1;
		width: 100%;
		max-height: var(--e);
		overflow: hidden;
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
