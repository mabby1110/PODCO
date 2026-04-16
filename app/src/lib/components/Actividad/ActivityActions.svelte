<script lang="ts">
	import { enhance } from '$app/forms';
	import DatePicker from '$lib/components/DatePicker.svelte';
	import FormOptionalInput from '$lib/components/FormOptionalInput.svelte';
	import { getStyleForPhase } from '$lib/utils/util';
	import FormInput from '../FormInput.svelte';
	import { invalidate } from '$app/navigation';
	import ActivityOptionalSubmit from './ActivityOptionalSubmit.svelte';
	import FormOportunidad from '../Oportunidad/FormOportunidad.svelte';

	let { eventData } = $props();
	let currentPhase = $derived(Number(eventData.fase.id_fase));
	let nextPhase = $derived(currentPhase + 5);

	let nuevoRequisito = $state('');
	let nuevaHistoria = $state('');
	let nuevaObservacion = $state('');

	let isOpen = $state(false);
	let isSubmitting = $state(false);
	let submit = $state(false);
	let submitUpdate = $state(false);
	let submitCancel = $state(false);
	let newOp = $state(false);

	let style = $derived(getStyleForPhase(currentPhase + 5));

	function concatStrings(anterior: string, nueva: string): string {
		if (!anterior || anterior.trim() === '') return nueva;
		return `${anterior}, ${nueva}`;
	}

	function handleSubmit() {
		return async ({ result }: any) => {
			isSubmitting = false;
			if (result.type === 'success') {
				nuevaHistoria = '';
			}
			await invalidate('app:data');
			await invalidate('app:calendar');
		};
	}
</script>

<form
	method="POST"
	action="/actividades?/updateActivity"
	use:enhance={() => {
		isSubmitting = true;
		return handleSubmit();
	}}
>
	<div class="actions">
		{#if submit}
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
		{:else if submitUpdate}
			<h3>Editar informacion</h3>
			<div class="opcional">
				<div class="opciones">
					{#if currentPhase == 3}
						<FormOptionalInput title="+Nueva cotizacion">
							<div class="cotizacion">
								<UploadFile label="Nueva Cotización" name="quoteFile" required />
							</div>
						</FormOptionalInput>
					{/if}
					<FormOptionalInput title="+Historia">
						<FormInput
							label="Historia"
							name="historia"
							value={eventData.historia}
							type="textarea"
							required
						/>
					</FormOptionalInput>
					<FormOptionalInput title="+Observaciones">
						<FormInput
							label="Observaciones"
							name="observaciones"
							value={eventData.Observaciones}
							type="textarea"
							required
						/>
					</FormOptionalInput>
					<FormOptionalInput title="+Objetivo">
						<FormInput
							label="Objetivo"
							name="objetivo"
							value={eventData.objetivo}
							type="textarea"
							required
						/>
					</FormOptionalInput>
					<FormOptionalInput title="+Agregar requisitos">
						<FormInput
							label="Requisitos"
							name="nuevosRequisitos"
							value={nuevoRequisito}
							placeholder="Viáticos, hospedaje, transporte, permisos de acceso, equipo de seguridad, herramientas especiales u otros requerimientos operativos"
							type="textarea"
							required
						/>
					</FormOptionalInput>

					<FormOptionalInput title="+Postergar">
						<div class="opciones">
							<FormInput
								label="Postergar"
								name="nuevaHistoria"
								value={nuevaHistoria}
								placeholder="Motivo de la postergación y acción a realizar"
								type="textarea"
								required
							/>
							<DatePicker title="Fecha Seguimiento" />
						</div>
					</FormOptionalInput>
				</div>
			</div>
		{:else if newOp}
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
	</div>

	<!-- datos para el sistema -->
	<input type="hidden" name="id" value={eventData.id} />
	{#if eventData.historial_cambios}
		<input type="hidden" name="historial_cambios" value={eventData.historial_cambios} />
	{/if}
	{#if nuevaHistoria}
		<input type="hidden" name="historia" value={concatStrings(eventData.historia, nuevaHistoria)} />
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
	{#if !newOp}
		<input type="hidden" name="id_agente" value={eventData?.agente?.id} />
	{/if}

	<div class="submit">
		<ActivityOptionalSubmit
			nextFase={eventData.fase.accion}
			bind:isOpen
			bind:submit
			bind:submitUpdate
			bind:submitCancel
			bind:newOp
		/>

		{#if submit}
			<input type="hidden" name="fase" value={nextPhase} />
			<button type="submit" class="butter" {style} disabled={isSubmitting}>
				{isSubmitting ? 'Procesando...' : 'Finzalizar'}
			</button>
		{:else if submitUpdate}
			<button type="submit" class="butter" disabled={isSubmitting}>Actualizar</button>
		{:else if newOp}
			<button type="submit" class="butter" {style} disabled={isSubmitting}>
				{isSubmitting ? 'Procesando...' : 'Crear Oportunidad'}
			</button>
		{:else if submitCancel}
			<input type="hidden" name="fase" value={0} />
			<button type="submit" class="butter" disabled={isSubmitting}>Cancelar Actividad</button>
		{/if}
	</div>
</form>

<style>
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
</style>
