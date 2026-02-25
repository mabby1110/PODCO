<script lang="ts">
	import { enhance } from '$app/forms';
	import DatePicker from '$lib/components/DatePicker.svelte';
	import FormOptionalSubmit from '$lib/components/FormOptionalSubmit.svelte';
	import FormOptionalInput from '$lib/components/FormOptionalInput.svelte';
	import { getDurationForPhase, getStyleForPhase } from '$lib/utils/util';
	import { fases_actividad } from '$lib';
	import FormInput from '../FormInput.svelte';
	import { invalidate } from '$app/navigation';
	import { selectedActivity } from '$lib/stores/selectedActivity';

	let { eventData } = $props();
	let nuevoRequisito = $state('');
	let currentPhase = $derived(Number(eventData.fase.id_fase));
	let nextPhase = $derived(currentPhase + 5);
	let nuevaHistoria = $state('');
	let isSubmitting = $state(false);
	let submitUpdate = $state(false);
	let submitCancel = $state(false);

	let style = $derived(getStyleForPhase(currentPhase + 5));
	let duration = $derived(getDurationForPhase(currentPhase));

	// Placeholder dinámico por fase
	let fasePlaceholder = $derived(
		fases_actividad.find((f) => f.id_fase == currentPhase)?.placeholder ??
			'Ingresa la acción realizada'
	);

	function combinarHistoria(anterior: string, nueva: string): string {
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

<section class="actions">
	<form
		method="POST"
		action="?/updateActivity"
		use:enhance={() => {
			isSubmitting = true;
			return handleSubmit();
		}}
	>
		<input type="hidden" name="id" value={eventData.id} />
		<input
			type="hidden"
			name="historia"
			value={combinarHistoria(eventData.historia, nuevaHistoria)}
		/>
		<input
			type="hidden"
			name="requisitos"
			value={combinarHistoria(eventData.requisitos, nuevoRequisito)}
		/>

		{#if !submitCancel && !submitUpdate}
			{#if currentPhase >= 2 || currentPhase == 0}
				<section class="historia">
					<h3>Historia</h3>
					<p>{eventData.historia}</p>
				</section>
			{/if}
			{#if eventData.requisitos}
				<!-- <EditableField id="requisitos" name="requisitos" type="text" bind:value={requisitos} /> -->
				<section class="requisitos">
					<h3>Requisitos</h3>
					<p>{eventData.requisitos}</p>
				</section>
			{/if}

			{#if currentPhase == 1}
				<FormInput
					label="Acciones"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder={fasePlaceholder}
					type="textarea"
					required
				/>
			{/if}
		{/if}

		{#if currentPhase != 0}
			{#if submitUpdate}
				<FormInput
					label="Postergar"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder="Motivo de la postergación y acción a realizar"
					type="textarea"
					required
				/>
				<FormOptionalInput title="+Agregar requisitos">
					<FormInput
						label="Requisitos"
						name="nuevoRequisitos"
						bind:value={nuevoRequisito}
						placeholder="Viáticos, hospedaje, transporte, permisos de acceso, equipo de seguridad, herramientas especiales u otros requerimientos operativos"
						type="textarea"
						required
					/>
				</FormOptionalInput>
				<DatePicker {duration} title="Fecha de compromiso" />
			{:else if submitCancel}
				<FormInput
					label="Pérdida"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder="Motivo de la pérdida"
					type="textarea"
					required
				/>
			{/if}
		{/if}
		{#if currentPhase != 6 && currentPhase != 0}
			<div class="submit">
				<FormOptionalSubmit bind:submitUpdate bind:submitCancel />

				{#if submitUpdate}
					<input type="hidden" name="fase" value={currentPhase} />
					<button type="submit" class="butter" disabled={isSubmitting}>Actualizar</button>
				{:else if submitCancel}
					<input type="hidden" name="fase" value={0} />
					<button type="submit" class="butter" disabled={isSubmitting}>Cancelar Actividad</button>
				{:else}
					<input type="hidden" name="fase" value={nextPhase} />
					<button type="submit" class="butter" {style} disabled={isSubmitting}>
						{isSubmitting ? 'Procesando...' : eventData.fase.accion}
					</button>
				{/if}
			</div>
		{/if}
	</form>
</section>

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
	form section {
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
