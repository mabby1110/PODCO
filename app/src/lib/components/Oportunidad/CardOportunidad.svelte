<script lang="ts">
	import { page } from '$app/state';
	import { selectedOp } from '$lib/stores/selectedOp';
	import { slide } from 'svelte/transition';
	import PhaseAction from './PhaseAction.svelte';
	import { getStyleForPhase } from '$lib/utils/util';
	import { fases } from '$lib';
	import { profile } from '$lib/stores/profileStore.svelte';

	const { clientes, agentes } = $derived(page.data);

	let event = $derived($selectedOp);
	// Agrupa todas las derivaciones en un solo $derived.by para mejor reactividad
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
			historia: event.historia || 'Sin historial registrado',
			requisitos: event.requisitos || 'Sin historial registrado',
			cotizaciones: event.cotizaciones || 'No hay cotizaciones',
			documentos: event.documentos || 'Sin documentos',
			style: getStyleForPhase(event.fase)
		};
	});

	function closeCard(e: MouseEvent) {
		e.stopPropagation();
		selectedOp.clear();
	}
</script>

{#if $selectedOp && eventData}
	<div class="card-d" transition:slide>
		<header style={eventData.style}>
			<button class="close-btn" onclick={closeCard} aria-label="Cerrar">✕</button>
			<h1>{eventData.motivo}</h1>
			<h3>{eventData.razon_social}</h3>
			<div class="meta">
				<p>{eventData.agente.nombre}</p>
				<p>-</p>
				<p>Fase: <strong>{eventData?.fase?.actual}</strong></p>
			</div>
		</header>

		<section class="grid">
			<p class="date">{eventData.inicio}</p>
			<PhaseAction {...eventData} />
		</section>
	</div>
{/if}

<style>
	.card-d {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		border-radius: 12px;
		border: 1px solid var(--color-secondary);
		width: 100%;
		overflow: hidden;
	}
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
	header h3 {
		margin-bottom: var(--b);
	}
	header h1 {
		width: 100%;
	}
	.close-btn {
		position: absolute;
		right: var(--a);
		background: transparent;
		border: none;
		line-height: 1;
		padding: 0;
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.2s;
		flex-shrink: 0;
	}
	.grid {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--b);
		overflow: auto;
	}
	.grid .date {
		position: absolute;
		right: var(--a);
		top: 0;
		font-size: 0.85em;
	}
	.meta {
		display: flex;
		gap: var(--a);
	}
</style>
