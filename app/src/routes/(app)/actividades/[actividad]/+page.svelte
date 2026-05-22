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
	import { postActivityUpdate } from '$lib/utils/actions.js';
	import { invalidateAll } from '$app/navigation';
	import { untrack } from 'svelte';
	import Entradas from '$lib/components/Entradas.svelte';

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

	let isEditing = $state(false);
	let activeHistoriaIndex = $state<number | null>(null);
	function handleHotOp(objetivo: string, index: number) {
		console.log(objetivo, index);
		activeHistoriaIndex = index;
		opModalStore.objetivo = objetivo;
		appState.toggleModalOp();
	}

	$effect(() => {
		if (opModalStore.succeded) {
			untrack(() => {
				if (activeHistoriaIndex !== null && eventData) {
					let historiaArray = JSON.parse(eventData.historia || '[]');

					if (historiaArray[activeHistoriaIndex]) {
						historiaArray[activeHistoriaIndex].id_op = opModalStore.id_op;
					}

					const updatedHistoria = JSON.stringify(historiaArray);

					postActivityUpdate(
						eventData.id,
						{ id: eventData.id, historia: updatedHistoria },
						'/actividades?/update'
					).then(() => {
						activeHistoriaIndex = null;
						opModalStore.clearStore(); // Debe restablecer succeded a false
						invalidateAll();
					});
				}
			});
		}
	});
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

			<section>
				<div class="block-header">
					{#if isEditing}
						<button type="button" class="close-btn" onclick={() => (isEditing = false)}>✕</button>
					{/if}
					<h2>Historia</h2>
				</div>
				<div class="block-content">
					{#if !isEditing}
						{#if eventData.historia}
							<div class="entradas">
								{#each JSON.parse(eventData.historia) as item, index}
									<div class="entrada">
										{#if item.id_op}
											<a href="/oportunidades/{item.id_op}">
												<b>{formatDateFull(parseDateTimeLocal(item.fecha))}</b> oportunidad:</a
											>
											{#if item.nombre_perfil}
												<p class="profile">{item.nombre_perfil},</p>
											{/if}
											<p>{item.entrada}</p>
										{:else}
											<button class="butter" onclick={() => handleHotOp(item.entrada, index)}
												>+</button
											>
											<b>{formatDateFull(parseDateTimeLocal(item.fecha))}:</b>
											{#if item.nombre_perfil}
												<p class="profile">{item.nombre_perfil},</p>
											{/if}
											<p>{item.entrada}</p>
										{/if}
									</div>
								{/each}
							</div>
						{:else}
							<p>No hay entradas</p>
						{/if}
					{:else}
						<Entradas
							historia={eventData.historia}
							objId={eventData.id}
							action={'/actividades?/update'}
						/>
					{/if}
					{#if !isEditing}
						<button type="button" class="butter" onclick={() => (isEditing = true)}
							>Nueva Entrada</button
						>
					{/if}
				</div>
			</section>
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
