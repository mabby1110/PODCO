<script lang="ts">
	import { page } from '$app/state';
	import { slide } from 'svelte/transition';
	import { getStyleForPhase } from '$lib/utils/util';
	import { fases } from '$lib';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { selectedActivity } from '$lib/stores/selectedActivity';

	const { agentes } = $derived(page.data);

	let event = $derived($selectedActivity);

	// Agrupa todas las derivaciones en un solo $derived.by para mejor reactividad
	const eventData = $derived.by(() => {
		if (!event) return null;

		return {
			agente: agentes?.find((e: { id: any }) => e.id == event.id_agente) ?? $profile,
			fase: fases.find(f => f.id_fase == event.fase),
			motivo: event?.motivo,
			inicio: event?.inicio,
			historia: event.historia || 'Sin historial registrado',
			requisitos: event.requisitos || 'No hay requisitos',
			style: getStyleForPhase(event.fase)
		};
	});

	function closeCard(e: MouseEvent) {
		e.stopPropagation();
		selectedActivity.clear();
	}
</script>

{#if $selectedActivity && eventData}
	<div class="card-d" transition:slide>
		<header style={eventData.style}>
			<button class="close-btn" onclick={closeCard} aria-label="Cerrar">✕</button>
			<h1>{eventData.motivo}</h1>
			<div class="meta">
				<p>{eventData.agente.nombre}</p>
				<p>-</p>
				<p>Fase: <strong>{eventData?.fase?.actual}</strong></p>
			</div>
		</header>

		<section class="grid">
			<p class="date">{eventData.inicio}</p>
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
