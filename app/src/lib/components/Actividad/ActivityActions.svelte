<script lang="ts">
	import { enhance } from '$app/forms';
	import DatePicker from '$lib/components/DatePicker.svelte';
	import FormOptionalInput from '$lib/components/FormOptionalInput.svelte';
	import { getStyleForPhase } from '$lib/utils/util';
	import FormInput from '../FormInput.svelte';
	import { invalidate } from '$app/navigation';
	import { selectedActivity } from '$lib/stores/selectedActivity';
	import ActivityOptionalSubmit from './ActivityOptionalSubmit.svelte';
	import FormOportunidad from '../Oportunidad/FormOportunidad.svelte';

	let { eventData } = $props();
	let currentPhase = $derived(Number(eventData.fase.id_fase));
	let nextPhase = $derived(currentPhase + 5);

	let nuevoRequisito = $state('');
	let nuevaHistoria = $state('');
	let nuevaObservacion = $state('');

	let isSubmitting = $state(false);
	let submitOp = $state(false);
	let submitUpdate = $state(false);
	let submitCancel = $state(false);

	let style = $derived(getStyleForPhase(currentPhase + 5));

	function concatStrings(anterior: string, nueva: string): string {
		if (!anterior || anterior.trim() === '') return nueva;
		return `${anterior}, ${nueva}`;
	}

	function handleSubmit() {
		return async ({ result }: any) => {
			selectedActivity.clear();
			isSubmitting = false;
			if (result.type === 'success') {
				nuevaHistoria = '';
			}
			await invalidate('app:data');
		};
	}
</script>

<div class="actions">
	<form
		method="POST"
		action="/actividades?/updateActivity"
		use:enhance={() => {
			isSubmitting = true;
			return handleSubmit();
		}}
	>
		{#if !submitCancel && !submitUpdate && !submitOp}
			{#if currentPhase == 1}
				<FormInput
					label="Seguimiento"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder="Actividades realizadas"
					type="textarea"
					required
				/>
				<FormOptionalInput title="+Observaciones">
					<FormInput
						label="Observaciones"
						name="nuevaObservacion"
						bind:value={nuevaObservacion}
						placeholder="Documenta novedades, detalles importantes y pautas a seguir"
						type="textarea"
						required
					/>
				</FormOptionalInput>
			{/if}
		{/if}

		{#if currentPhase != 0}
			{#if submitUpdate}
				<FormInput
					label="Justificación"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder="Motivo de la postergación y acción a realizar"
					type="textarea"
					required
				/>
				<DatePicker title="Fecha de compromiso" />
			{:else if submitOp}
				<FormOportunidad />
				<input type="hidden" name="motivo_inicial" value={eventData.motivo} />
			{:else if submitCancel}
				<FormInput
					label="Justificación"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder="Motivo de la cancelación"
					type="textarea"
					required
				/>
			{/if}
		{/if}

		<!-- datos para el sistema -->
		<input type="hidden" name="id" value={eventData.id} />
		{#if eventData.historial_cambios}
			<input type="hidden" name="historial_cambios" value={eventData.historial_cambios} />
		{/if}
		{#if nuevaHistoria}
			<input
				type="hidden"
				name="historia"
				value={concatStrings(eventData.historia, nuevaHistoria)}
			/>
		{/if}
		{#if nuevoRequisito}
			<input
				type="hidden"
				name="requisitos"
				value={concatStrings(eventData.requisitos, nuevoRequisito)}
			/>
		{/if}
		{#if nuevaObservacion}
			<input
				type="hidden"
				name="observaciones"
				value={concatStrings(eventData.observaciones, nuevaObservacion)}
			/>
		{/if}
		{#if nextPhase == 6}
			<input type="hidden" name="fecha_cierre" value={new Date().toISOString()} />
		{/if}
		{#if !submitOp}
			<input type="hidden" name="id_agente" value={eventData.agente.id} />
		{/if}
		{#if currentPhase != 6 && currentPhase != 0}
			<div class="submit">
				<ActivityOptionalSubmit bind:submitUpdate bind:submitCancel bind:submitOp />

				{#if submitUpdate}
					<button type="submit" class="butter" disabled={isSubmitting}>Actualizar</button>
				{:else if submitOp}
					<button type="submit" class="butter" {style} disabled={isSubmitting}>
						{isSubmitting ? 'Procesando...' : 'Crear Oportunidad'}
					</button>
				{:else if submitCancel}
					<input type="hidden" name="fase" value={0} />
					<button type="submit" class="butter" disabled={isSubmitting}>Cancelar Actividad</button>
				{:else}
					<input type="hidden" name="fase" value={nextPhase} />
					<button type="submit" class="butter" {style} disabled={isSubmitting}>
						{isSubmitting ? 'Procesando...' : 'Finzalizar'}
					</button>
				{/if}
			</div>
		{/if}
	</form>
</div>

<style>
	.actions {
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 100%;
		padding: var(--b);
	}

	form {
		display: flex;
		flex-wrap: wrap;
		gap: var(--c);
		width: 100%;
	}
	.butter:hover:not(:disabled) {
		transform: translateY(-2px);
	}

	.butter:active:not(:disabled) {
		transform: translateY(0);
	}

	.butter:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.submit {
		display: flex;
		gap: var(--a);
		justify-content: flex-end;
		flex-grow: 1;
	}
</style>
