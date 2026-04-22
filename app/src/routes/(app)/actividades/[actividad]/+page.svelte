<script lang="ts">
	import { page } from '$app/state';
	import { getStyleForPhase } from '$lib/utils/util';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { fases_actividad } from '$lib';
	import ActivityActions from '$lib/components/Actividad/ActivityActions.svelte';
	import Card from '$lib/components/Card.svelte';
	import { formatDateFull, parseDateTimeLocal } from '$lib/utils/agenda.js';
	import { appState } from '$lib/stores/appState.svelte.js';
	import { opModalStore } from '$lib/stores/opModalStore.svelte.js';

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

	function handleHotOp(objetivo: string) {
		opModalStore.objetivo =  objetivo;
		appState.toggleModalOp();
	}
</script>

{#if eventData}
	<Card headerStyle={eventData.style}>
		{#snippet header()}
			<button onclick={() => history.back()} class="close {currentFase}" aria-label="Cerrar">
				✕
			</button>
			<h1>{eventData.motivo}</h1>
			<div class="meta">
				<p class="date">{eventData.inicio}</p>
				<p>|</p>
				<p>{eventData?.agente?.nombre}</p>
			</div>
		{/snippet}

		{#snippet content()}
			<section>
				<p>Fase: <strong>{eventData?.fase?.actual}</strong></p>
			</section>
			{#if eventData.objetivo}
				<section>
					<h3>Objetivos</h3>
					<p>{eventData.objetivo}</p>
				</section>
			{/if}
			{#if eventData.requisitos}
				<section>
					<h3>Requisitos</h3>
					<p>{eventData.requisitos}</p>
				</section>
			{/if}
			{#if eventData.observaciones}
				<section>
					<h3>Observaciones</h3>
					<p>{eventData.observaciones}</p>
				</section>
			{/if}

			{#if eventData.historia}
				<section>
					<h3>Historia</h3>
					<div class="entradas">
						{#each JSON.parse(eventData?.historia) as item}
							<div class="entrada">
								<button class="butter" onclick={()=>handleHotOp(item.entrada)}>+</button>
								<b>{formatDateFull(parseDateTimeLocal(item.fecha))}:</b>
								<p>{item.entrada}</p>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		{/snippet}

		{#snippet actions()}
			<ActivityActions {eventData} />
		{/snippet}
	</Card>
{/if}

<style>
	.meta {
		display: flex;
		gap: var(--a);
	}
	.w {
		color: white;
	}
</style>
