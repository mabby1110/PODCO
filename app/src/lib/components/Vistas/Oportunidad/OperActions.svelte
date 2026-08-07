<script lang="ts">
	import DatePicker from '$lib/components/Formularios/DatePicker.svelte';
	import FormActions from '$lib/components/Formularios/FormActions.svelte';
	import FormInput from '$lib/components/Formularios/FormInput.svelte';
	import FormOptionalInput from '$lib/components/Formularios/FormOptionalInput.svelte';
	import FormOptionalSubmit from '$lib/components/Formularios/FormOptionalSubmit.svelte';
	import UploadFile from '$lib/components/Formularios/UploadFile.svelte';
	import { agregarEntrada, concatStrings } from '$lib/utils/cardActions';
	import { getStyleForPhase } from '$lib/utils/util';

	let { eventData } = $props();

	let currentPhase = $derived(Number(eventData.fase.id_fase));
	let nextPhase = $derived(Number(currentPhase) + 1);
	let placeholder = $derived(eventData.fase.placeholder);

	let nuevoRequisito = $state('');
	let nuevaHistoria = $state('');
	let nuevaCotizacion = $state('');
	let nuevaOc = $state('');
	let nuevaObeservacion = $state('');

	let isOpen = $state(false);
	let submit = $state(false);
	let submitUpdate = $state(false);
	let style = $derived(getStyleForPhase(currentPhase + 1));

	function handleSuccess() {
		nuevoRequisito = '';
		nuevaHistoria = '';
		nuevaCotizacion = '';
		nuevaOc = '';
		nuevaObeservacion = '';
	}
</script>

{#if currentPhase >= 4 && currentPhase != 0 && currentPhase != 6}
	<FormActions action="/oportunidades?/updateOp" bind:isOpen onSuccess={handleSuccess}>
		{#snippet inputs()}
			{#if submit}
				{#if currentPhase == 4}
					<FormInput
						label="Ejecución de envío"
						name="nuevaHistoria"
						bind:value={nuevaHistoria}
						{placeholder}
						type="textarea"
						required
					/>
					<div class="opcional">
						<h3>Informacion adicional</h3>
						<div class="opciones">
							<FormOptionalInput title="+Observaciones">
								<FormInput
									label="Observaciones"
									name="observaciones"
									bind:value={nuevaObeservacion}
									placeholder="Detalles importantes y pautas a seguir"
									type="textarea"
									required
								/>
							</FormOptionalInput>
							<FormOptionalInput title="+Agregar requisitos">
								<FormInput
									label="Requisitos"
									name="nuevosRequisitos"
									bind:value={nuevoRequisito}
									placeholder="Viáticos, hospedaje, transporte, permisos de acceso, equipo de seguridad, herramientas especiales u otros requerimientos operativos"
									type="textarea"
									required
								/>
							</FormOptionalInput>
							<FormOptionalInput title="+adjuntos">
								<UploadFile label="Subir documentos" name="docFile" multiple />
							</FormOptionalInput>
						</div>
					</div>
					<div class="opcional">
						<h3>Documentos de operación</h3>
						<div class="opciones">
							{#if eventData.adjuntos.length > 0}
								{#each eventData.adjuntos as documento}
									<p>{documento.titulo}</p>
								{/each}
							{:else}
								<p>Subir cotizacion para avanzar fase</p>
							{/if}
						</div>
					</div>
					<DatePicker title="Salida de paquete" />
					<input type="hidden" name="fecha_proceso_entrega" value={new Date().toISOString()} />
				{:else if currentPhase == 5}
					<FormInput
						label="Estado de entrega / Incidencias"
						name="nuevaHistoria"
						bind:value={nuevaHistoria}
						{placeholder}
						type="textarea"
						required
					/>
					<div class="opcional">
						<h3>Informacion adicional</h3>
						<div class="opciones">
							<FormOptionalInput title="+Observaciones">
								<FormInput
									label="Observaciones"
									name="observaciones"
									bind:value={nuevaObeservacion}
									placeholder="Detalles importantes y pautas a seguir"
									type="textarea"
									required
								/>
							</FormOptionalInput>
							<FormOptionalInput title="+Agregar requisitos">
								<FormInput
									label="Requisitos"
									name="nuevosRequisitos"
									bind:value={nuevoRequisito}
									placeholder="Viáticos, hospedaje, transporte, permisos de acceso, equipo de seguridad, herramientas especiales u otros requerimientos operativos"
									type="textarea"
									required
								/>
							</FormOptionalInput>
							<FormOptionalInput title="+adjuntos">
								<UploadFile label="Subir documentos" name="docFile" multiple />
							</FormOptionalInput>
						</div>
					</div>
					<div class="oc">
						<UploadFile label="Documentos de operacion" name="docOperFile" required />
					</div>
					<DatePicker title="Salida de paquete" />
					<input type="hidden" name="fecha_transito" value={new Date().toISOString()} />
				{/if}
			{/if}
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
			{#if nuevaCotizacion}
				<input
					type="hidden"
					name="cotizaciones_presentadas"
					bind:value={eventData.cotizaciones_presentadas}
				/>
			{/if}
			{#if nuevaObeservacion}
				<input
					type="hidden"
					name="observaciones"
					value={concatStrings(eventData.observaciones, nuevaObeservacion)}
				/>
			{/if}
			{#if eventData.agente}
				<input type="hidden" name="agente" value={eventData.agente.nombre} />
			{/if}
			{#if nextPhase == 6}
				<input type="hidden" name="fecha_cierre" value={new Date().toISOString()} />
			{/if}
		{/snippet}

		{#snippet submitContent(isSubmitting: boolean)}
			<FormOptionalSubmit nextFase={eventData.fase.accion} bind:isOpen bind:submit />
			{#if submit}
				<input type="hidden" name="fase" value={nextPhase} />
				<button type="submit" class="butter" {style} disabled={isSubmitting}>
					{isSubmitting ? 'Procesando...' : eventData.fase.accion}
				</button>
			{:else if submitUpdate}
				<input type="hidden" name="fase" value={currentPhase} />
				<button type="submit" class="butter" disabled={isSubmitting}>Actualizar</button>
			{/if}
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
