<script lang="ts">
	import { page } from '$app/state';
	import { fases_actividad } from '$lib';
	import Entradas from '$lib/components/Acciones/Entradas.svelte';
	import CustomInput from '$lib/components/Formularios/CustomInput.svelte';
	import DatePicker from '$lib/components/Formularios/DatePicker.svelte';
	import EditableInput from '$lib/components/Formularios/EditableInput.svelte';
	import Card from '$lib/components/Tarjetas/Card.svelte';
	import ActivityActions from '$lib/components/Vistas/Actividad/ActivityActions.svelte';
	import { profile } from '$lib/stores/profileStore.svelte.js';
	import { getStyleForPhase } from '$lib/utils/util.js';

	let { data } = $props();
	const event = $derived(data.actividad);
	const { agentes } = $derived(page.data);
	const eventData = $derived.by(() => {
		if (!event) return null;

		return {
			...event,
			id: event.id,
			agente: agentes?.find((e: { id: any }) => e.id == event.id_agente) ?? $profile,
			fase: fases_actividad.find((f) => f.id_fase == event.fase),
			style: getStyleForPhase(event.fase)
		};
	});
	let currentFase = $derived(eventData?.fase?.id_fase == 6 ? 'w' : '');

	let isEditing = $state(false);
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
				<p>Fase: <strong>{eventData?.fase?.actual}</strong></p>
			</div>
		{/snippet}

		{#snippet content()}
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
				<div class="header">
					<h3>Historia:</h3>
				</div>
				<div class="content">
					<Entradas
						{isEditing}
						historia={eventData?.historia}
						objId={eventData?.id}
						action={'/actividades?/update'}
					/>
				</div>
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
