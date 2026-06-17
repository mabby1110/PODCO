<script lang="ts">
	import DatePicker from '$lib/components/DatePicker.svelte';
	import FormOptionalInput from '$lib/components/FormOptionalInput.svelte';
	import { getStyleForPhase } from '$lib/utils/util';
	import FormInput from '../FormInput.svelte';
	import ActivityOptionalSubmit from './ActivityOptionalSubmit.svelte';
	import { agregarEntrada, concatStrings } from '$lib/utils/cardActions';
	import FormActions from '../FormActions.svelte';
	import type { Snippet } from 'svelte';

	let {
		eventData,
		isEditing = $bindable()
	}: {
		eventData: any;
		isEditing?: boolean;
	} = $props();
	let currentPhase = $derived(Number(eventData.fase.id_fase));
	let nextPhase = $derived(currentPhase + 5);

	let nuevoRequisito = $state('');
	let nuevaHistoria = $state('');
	let nuevaObservacion = $state('');

	let isOpen = $state(false);
	let isSubmitting = $state(false);
	let submit = $state(false);
	let submitCancel = $state(false);
	let newOp = $state(false);

	let style = $derived(getStyleForPhase(currentPhase + 5));
	function handleSuccess() {
		nuevoRequisito = '';
		nuevaHistoria = '';
	}
</script>

{#if currentPhase != 0 && currentPhase != 6}
	<FormActions action="/actividades?/update" bind:isOpen onSuccess={handleSuccess}>
		{#snippet fieldsContent()}
			<div class="actions">
				{#if submit}
					{#if currentPhase == 1}
						<FormInput
							label="Conclusión"
							name="nuevaHistoria"
							bind:value={nuevaHistoria}
							placeholder="Resultados técnicos, potencial detectado y acuerdos de seguimiento."
							type="textarea"
							required
						/>
					{/if}
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
			</div>
		{/snippet}
		{#snippet hiddenContent()}
			<input type="hidden" name="id" value={eventData.id} />
			{#if nuevaHistoria}
				<input
					type="hidden"
					name="historia"
					value={agregarEntrada(eventData.historia, nuevaHistoria)}
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
			{#if nextPhase == 6 && submit}
				<input type="hidden" name="fecha_cierre" value={new Date().toISOString()} />
			{/if}
			{#if !newOp}
				<input type="hidden" name="id_agente" value={eventData?.agente?.id} />
			{/if}
		{/snippet}
		{#snippet submitContent()}
			<div class="submit">
				{#if !submit && !submitCancel}
					<button type="button" class="butter {isEditing}" onclick={() => (isEditing = !isEditing)}>
						Editar
					</button>
				{/if}

				{#if submit}
					<input type="hidden" name="fase" value={nextPhase} />
					<button type="submit" class="butter" {style} disabled={isSubmitting}>
						{isSubmitting ? 'Procesando...' : 'Finzalizar'}
					</button>
				{:else if newOp}
					<button type="submit" class="butter" {style} disabled={isSubmitting}>
						{isSubmitting ? 'Procesando...' : 'Crear Oportunidad'}
					</button>
				{:else if submitCancel}
					<input type="hidden" name="fase" value={0} />
					<button type="submit" class="butter" disabled={isSubmitting}>Cancelar Actividad</button>
				{/if}
				<ActivityOptionalSubmit
					nextFase={eventData.fase.accion}
					bind:isOpen
					bind:submit
					bind:submitCancel
				/>
			</div>
		{/snippet}
	</FormActions>
{/if}

<style>
	.butter:hover:not(:disabled) {
		transform: translateY(-2px);
	}

	.butter:active:not(:disabled) {
		transform: translateY(0);
	}
	.true {
		background-color: var(--color-highlight);
	}
	.butter:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.opcional {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
	.opciones {
		display: flex;
		width: 100%;
		flex-wrap: wrap;
		gap: var(--a);
	}
	.submit {
		position: fixed;
		bottom: 0;
	}
</style>
