<script lang="ts">
	import { page } from '$app/state';
	import { slide } from 'svelte/transition';
	import { getStyleForPhase } from '$lib/utils/util';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { selectedActivity } from '$lib/stores/selectedActivity';
	import { fases_actividad } from '$lib';
	import ActivityActions from './ActivityActions.svelte';

	const { agentes } = $derived(page.data);

	let event = $derived($selectedActivity);

	const eventData = $derived.by(() => {
		if (!event) return null;

		return {
			id: event.id,
			agente: agentes?.find((e: { id: any }) => e.id == event.id_agente) ?? $profile,
			fase: fases_actividad.find((f) => f.id_fase == event.fase),
			motivo: event?.motivo,
			inicio: event?.inicio,
			historia: event.historia,
			requisitos: event.requisitos,
			objetivo: event.objetivo,
			observaciones: event.observaciones,
			tipo_actividad: event.tipo_actividad,
			style: getStyleForPhase(event.fase)
		};
	});

	function closeCard(e: MouseEvent) {
		e.stopPropagation();
		selectedActivity.clear();
	}
</script>

{#if $selectedActivity && eventData}
	<div class="card-full" transition:slide>
		<header style={eventData.style}>
			<button class="close-btn" onclick={closeCard} aria-label="Cerrar">✕</button>
			<h1>{eventData.motivo}</h1>
			<div class="meta">
				<p class="date">{eventData.inicio}</p>
				<p>|</p>
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
			{#if eventData.requisitos}
				<div>
					<h3>Requisitos</h3>
					<p>{eventData.requisitos}</p>
				</div>
			{/if}
			{#if eventData.objetivo}
				<div>
					<h3>Objetivos</h3>
					<p>{eventData.objetivo}</p>
				</div>
			{/if}
			{#if eventData.observaciones}
				<div>
					<h3>Observaciones</h3>
					<p>{eventData.observaciones}</p>
				</div>
			{/if}
			<div class="card-actions">
				<ActivityActions {eventData} />
			</div>
		</div>
	</div>
{/if}

<style>
	.card-full {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		border-radius: 12px;
		border: 1px solid var(--color-secondary);
		width: 100%;
		height: fit-content;
		max-height: 80vh;
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
