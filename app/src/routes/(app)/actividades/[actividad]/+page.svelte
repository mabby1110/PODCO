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
	import Entradas from '$lib/components/Entradas.svelte';
	import EditableInput from '$lib/components/App/form/EditableInput.svelte';
	import CustomInput from '$lib/components/App/form/CustomInput.svelte';
	import DatePicker from '$lib/components/DatePicker.svelte';
	// 💡 NOTA: Se eliminó 'untrack' ya que no lo necesitamos en eventos

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
		activeHistoriaIndex = index;
		opModalStore.objetivo = objetivo;
		appState.toggleModalOp();
	}

	function handleModalSuccess(e: Event) {
		const customEvent = e as CustomEvent<{ id_op: string }>;
		const id_op = customEvent.detail.id_op;
		if (activeHistoriaIndex !== null && eventData) {
			let historiaArray = JSON.parse(eventData.historia || '[]');

			if (historiaArray[activeHistoriaIndex]) {
				historiaArray[activeHistoriaIndex].id_op = id_op;
			}

			const updatedHistoria = JSON.stringify(historiaArray);

			postActivityUpdate(
				eventData.id,
				{ id: eventData.id, historia: updatedHistoria },
				'/actividades?/update'
			).then(() => {
				activeHistoriaIndex = null;
				opModalStore.clearStore();
				invalidateAll();
			});
		}
	}
</script>

<svelte:window onmodalOpSuccess={handleModalSuccess} />

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
			<CustomInput action="/actividades?/update" id={eventData.id} {isEditing}>
				<DatePicker />
			</CustomInput>
			<EditableInput
				{isEditing}
				id={eventData.id}
				label="Objetivo"
				name="objetivo"
				type="textarea"
				value={eventData.objetivo}
				action="/actividades?/update"
				placeholder="Objetivo"
			>
				{#snippet header()}
					<input type="hidden" name="id" value={eventData.id} />
				{/snippet}
			</EditableInput>
			<EditableInput
				{isEditing}
				id={eventData.id}
				label="Requisitos"
				name="requisitos"
				type="textarea"
				value={eventData.requisitos}
				action="/actividades?/update"
				placeholder="Requisitos"
			>
				{#snippet header()}
					<input type="hidden" name="id" value={eventData.id} />
				{/snippet}
			</EditableInput>
			<EditableInput
				{isEditing}
				id={eventData.id}
				label="Observaciones"
				name="observaciones"
				type="textarea"
				value={eventData.observaciones}
				action="/actividades?/update"
				placeholder="Observaciones"
			>
				{#snippet header()}
					<input type="hidden" name="id" value={eventData.id} />
				{/snippet}
			</EditableInput>

			<section>
				<h2>Historia</h2>
				<Entradas
					{isEditing}
					historia={eventData.historia}
					objId={eventData.id}
					action={'/actividades?/update'}
				/>
			</section>
		{/snippet}

		{#snippet actions()}
			<ActivityActions {eventData} bind:isEditing />
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
	.nueva_entrada {
		display: flex;
		gap: var(--a);
	}
</style>
