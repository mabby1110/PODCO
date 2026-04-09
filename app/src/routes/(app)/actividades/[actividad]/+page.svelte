<script lang="ts">
	import { page } from '$app/state';
	import { slide } from 'svelte/transition';
	import { getStyleForPhase } from '$lib/utils/util';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { fases_actividad } from '$lib';
	import ActivityActions from '$lib/components/Actividad/ActivityActions.svelte';

	let { data } = $props();
	const event = $derived(data.actividad);
	const { agentes } = $derived(page.data);

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
			historial_cambios: event.historial_cambios,
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
			<h1>{eventData.motivo}</h1>
			<div class="meta">
				<p class="date">{eventData.inicio}</p>
				<p>|</p>
				<p>{eventData?.agente?.nombre}</p>
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
	.meta {
		display: flex;
		gap: var(--a);
	}
	.w {
		color: white;
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
