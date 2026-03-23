<script lang="ts">
	import { enhance } from '$app/forms';
	import DatePicker from '$lib/components/DatePicker.svelte';
	import FormOptionalSubmit from '$lib/components/FormOptionalSubmit.svelte';
	import FormOptionalInput from '$lib/components/FormOptionalInput.svelte';
	import { getStyleForPhase } from '$lib/utils/util';
	import { fases, motivosOportunidad } from '$lib';
	import FormSelectMotivo from '$lib/components/FormSelectMotivo.svelte';
	import FormInput from '../FormInput.svelte';
	import { selectedOp } from '$lib/stores/selectedOp';
	import { invalidate } from '$app/navigation';
	import UploadFile from '$lib/components/UploadFile.svelte';

	let { eventData } = $props();

	let currentPhase = $derived(Number(eventData.fase.id_fase));
	let nextPhase = $derived(Number(currentPhase) + 1);

	let nuevoRequisito = $state('');
	let nuevaHistoria = $state('');
	let nuevaCotizacion = $state('');
	let nuevaOc = $state('');

	let isSubmitting = $state(false);
	let submitUpdate = $state(false);
	let submitCancel = $state(false);
	let style = $derived(getStyleForPhase(currentPhase + 1));

	// Placeholder dinámico por fase
	let fasePlaceholder = $derived(
		fases.find((f) => f.id_fase == currentPhase)?.placeholder ?? 'Ingresa la acción realizada'
	);

	function combinarHistoria(anterior: string, nueva: string): string {
		if (!anterior || nueva.trim() == '') return nueva;
		return `${anterior}, ${nueva}`;
	}
	function handleSubmit() {
		return async ({ result }: any) => {
			selectedOp.clear();
			isSubmitting = false;
			if (result.type === 'success') {
				nuevaHistoria = '';
				nuevaCotizacion = '';
				nuevaOc = '';
			}

			await invalidate('app:calendar');
		};
	}

	// $effect(() => console.log(JSON.parse(cotizaciones)));
</script>

<div class="actions">
	<form
		method="POST"
		action="/oportunidades?/updateOp"
		enctype="multipart/form-data"
		use:enhance={() => {
			isSubmitting = true;
			return handleSubmit();
		}}
	>
		{#if !submitCancel && !submitUpdate}
			<!-- Acciones -->
			{#if currentPhase == 2}
				<FormSelectMotivo list={motivosOportunidad} disableCustom={false} />
				<FormInput
					label="Análisis"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder={fasePlaceholder}
					type="textarea"
					required
				/>
				<div class="cotizacion">
					<UploadFile label="Cotizaciones" name="quoteFile" required multiple />
				</div>
				<DatePicker title="Fecha seguimiento o Expiración" />
			{:else if currentPhase == 3}
				<FormInput
					label={eventData.fase.actual}
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder={fasePlaceholder}
					type="textarea"
					required
				/>

				<div class="oc">
					<UploadFile label="Cotizacion generada en Contpaqi" name="quoteWonFile" required />
				</div>
				<div class="oc">
					<UploadFile label="Orden de compra del cliente" name="ocFile" required />
				</div>
				<DatePicker title="Seguimiento / Envío" />
			{:else if currentPhase == 4}
				<FormInput
					label="Ejecución de envío"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder="Detalles de Transporte y logística"
					type="textarea"
					required
				/>

				<div class="oc">
					<UploadFile label="Documentos de operacion" name="docOpFile" required />
				</div>
				<DatePicker title="Salida de paquete" />
			{:else if currentPhase == 5}
				<FormInput
					label="Estado de entrega / Incidencias"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder="Reporte de recepción y novedades"
					type="textarea"
					required
				/>

				<div class="oc">
					<UploadFile label="Documentos de operacion" name="docOpFile" required />
				</div>
				<DatePicker title="Salida de paquete" />
			{:else if currentPhase != 6}
				<FormInput
					label={eventData.fase.actual}
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder={fasePlaceholder}
					type="textarea"
					required
				/>
				<DatePicker title="Fecha de compromiso" />
			{/if}
		{/if}

		<!-- acciones opcionales -->
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
				{#if currentPhase == 3}
					<FormOptionalInput title="+Nueva cotizacion">
						<div class="cotizacion">
							<UploadFile label="Nueva Cotización" name="quoteFile" required />
						</div>
					</FormOptionalInput>
				{/if}
				<DatePicker title="Fecha de compromiso" />
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

		<!-- opciones generales -->
		<FormOptionalInput title="+Observaciones">
			<FormInput
				label="Observaciones"
				name="observaciones"
				bind:value={eventData.observaciones}
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
		<!-- datos compuestos -->
		<input type="hidden" name="id" bind:value={eventData.id} />
		{#if nuevaHistoria}
			<input
				type="hidden"
				name="historia"
				value={combinarHistoria(eventData.historia, nuevaHistoria)}
			/>
		{/if}
		{#if nuevoRequisito}
			<input
				type="hidden"
				name="requisitos"
				value={combinarHistoria(eventData.requisitos, nuevoRequisito)}
			/>
		{/if}
		{#if nuevaCotizacion}
			<input
				type="hidden"
				name="cotizaciones_presentadas"
				bind:value={eventData.cotizaciones_presentadas}
			/>
		{/if}
		{#if eventData.agente}
			<input type="hidden" name="agente" value={eventData.agente.nombre} />
		{/if}
		{#if nextPhase == 6}
			<input type="hidden" name="fecha_cierre" value={new Date().toISOString()} />
		{/if}

		<!-- opciones para envio de formulario -->
		{#if currentPhase != 6}
			<div class="submit">
				<FormOptionalSubmit bind:submitUpdate bind:submitCancel />

				{#if submitUpdate}
					<input type="hidden" name="fase" value={currentPhase} />
					<button type="submit" class="butter" disabled={isSubmitting}>Actualizar</button>
				{:else if submitCancel}
					<input type="hidden" name="fase" value={0} />
					<button type="submit" class="butter" disabled={isSubmitting}>Perder</button>
				{:else}
					<input type="hidden" name="fase" value={nextPhase} />
					<button type="submit" class="butter" {style} disabled={isSubmitting}>
						{isSubmitting ? 'Procesando...' : eventData.fase.accion}
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
		width: 100%;
	}
	form {
		display: flex;
		flex-wrap: wrap;
		width: 100%;
		padding: var(--a);
		gap: var(--b);
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
	.cotizacion,
	.oc {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
</style>
