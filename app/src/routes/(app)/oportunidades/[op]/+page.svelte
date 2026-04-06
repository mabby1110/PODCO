<script lang="ts">
	import { page } from '$app/state';
	import { slide } from 'svelte/transition';
	import { getStyleForPhase } from '$lib/utils/util';
	import { fases } from '$lib';
	import { profile } from '$lib/stores/profileStore.svelte';
	import FilePreview from '$lib/components/FilePreview.svelte';
	import PhaseAction from '$lib/components/Oportunidad/PhaseAction.svelte';

	let { data } = $props();

	// 1. Extraemos los datos del padre y del hijo
	const clientes = $derived(page.data.clientes || []);
	const agentes = $derived(page.data.agentes || []);

	// 2. Determinamos la oportunidad activa (Store vs URL)
	const event = $derived(data.oportunidad);

	// 3. Formateamos los datos para la vista (tu eventData original adaptado)

	const eventData = $derived.by(() => {
		if (!event) return null;
		return {
			id: event.id,
			razon_social:
				clientes?.find((c: { id: any }) => c.id == event.id_cliente)?.razon_social ?? '',
			agente: agentes?.find((e: { id: any }) => e.id == event.id_agente) ?? $profile,
			fase: fases.find((f) => f.id_fase == event.fase) || undefined,
			motivo: event?.motivo,
			inicio: event?.inicio,
			fin: event?.fin,
			historia: event.historia,
			necesidades: event.necesidades,
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
	let currentFase = $derived(eventData?.fase?.id_fase == 6 ? 'w' : '');
</script>

{#if eventData}
	<div class="card-full" transition:slide>
		<header style={eventData.style}>
			<button onclick={() => history.back()} class="close {currentFase}" aria-label="Cerrar">
				✕
			</button>
			<div class="title">
				<h1>{eventData.motivo}</h1>
				<h3>{eventData.razon_social}</h3>
			</div>
			<div class="meta">
				<p class="date">{eventData.inicio}</p>
				<p class="date">|</p>
				<p>{eventData?.agente?.nombre}</p>
			</div>
		</header>

		<div class="card-content">
			<p>Fase: <strong>{eventData.fase?.actual}</strong></p>

			{#if eventData.historia}
				<div>
					<h3>Historia</h3>
					<p>{eventData.historia}</p>
				</div>
			{/if}

			{#if eventData.necesidades}
				<div>
					<h3>Necesidades</h3>
					<p>{eventData.necesidades}</p>
				</div>
			{/if}

			{#if eventData.objetivo}
				<div>
					<h3>Objetivo</h3>
					<p>{eventData.objetivo}</p>
				</div>
			{/if}

			{#if eventData.requisitos}
				<div>
					<h3>Requisitos</h3>
					<p>{eventData.requisitos}</p>
				</div>
			{/if}

			{#if eventData.observaciones}
				<div>
					<h3>Observaciones</h3>
					<p>{eventData.observaciones}</p>
				</div>
			{/if}

			<FilePreview title="Cotizaciones Ganadas" data={eventData.cotizaciones_ganadas} />
			<FilePreview title="Cotizaciones Presentadas" data={eventData.cotizaciones_presentadas} />
			<FilePreview title="Orden de compra" data={eventData.oc_cliente} />
			<FilePreview title="Documentos de operacion" data={eventData.documentos_operacion} />
			<FilePreview title="Adjuntos" data={eventData.documentos} />

			<div class="card-actions">
				<PhaseAction {eventData} />
			</div>
		</div>
	</div>
{/if}

<style>
	header {
		display: flex;
		gap: var(--a);
		position: relative;
		flex-direction: column;
		justify-content: space-between;
		align-items: flex-start;
		background-color: var(--color-primary);
		backdrop-filter: blur(16px);
		padding: var(--a);

		position: sticky;
		top: 0;
		z-index: 99;
	}
	.meta {
		display: flex;
		gap: var(--a);
	}
	.w {
		color: white;
	}
	.close {
		position: absolute;
		top: 0;
		right: 0;
		background: transparent;
		border: none;
		padding: 0 var(--a);
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.2s;
		flex-shrink: 0;
		cursor: pointer;
		text-decoration: none;
	}
	.card-actions {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--b);
	}
	.meta {
		display: flex;
		gap: var(--a);
	}
</style>
