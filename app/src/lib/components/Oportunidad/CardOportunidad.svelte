<script lang="ts">
	import { page } from '$app/state';
	import { selectedOp } from '$lib/stores/selectedOp';
	import { slide } from 'svelte/transition';
	import { getStyleForPhase } from '$lib/utils/util';
	import { fases } from '$lib';
	import { profile } from '$lib/stores/profileStore.svelte';
	import PhaseAction from './PhaseAction.svelte';
	import FilePreview from '../FilePreview.svelte';

	const { clientes, agentes } = $derived(page.data);

	let event = $derived($selectedOp);

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
			cotizaciones_ganadas: event.cotizaciones_ganadas,
			cotizaciones_presentadas: event.cotizaciones_presentadas,
			oc_cliente: event.oc_cliente,
			documentos_operacion: event.documentos_operacion,
			documentos: event.documentos,
			objetivo: event.objetivo,
			style: getStyleForPhase(event.fase)
		};
	});

	function closeCard(e: MouseEvent) {
		e.stopPropagation();
		selectedOp.clear();
	}
</script>

{#if $selectedOp && eventData}
	<div class="card-full" transition:slide>
		<header style={eventData.style}>
			<button class="close-btn" onclick={closeCard} aria-label="Cerrar">✕</button>
			<div class="title">
				<h1>{eventData.motivo}</h1>
				<h3>{eventData.razon_social}</h3>
			</div>
			<div class="meta">
				<p class="date">{eventData.inicio}</p>
				<p class="date">|</p>
				<p>{eventData.agente.nombre}</p>
			</div>
		</header>
		<div class="card-content">
			<p>Fase: <strong>{eventData?.fase?.actual}</strong></p>
			{#if eventData.historia}
				<div>
					<h3>Historia</h3>
					<p>{eventData.historia}</p>
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

			<!-- DOCUMENTOS DE EVIDENCIA -->
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
	.close-btn {
		position: absolute;
		top: 0;
		right: 0;
		background: transparent;
		border: none;
		line-height: 1;
		padding: 0;
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.2s;
		flex-shrink: 0;
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
