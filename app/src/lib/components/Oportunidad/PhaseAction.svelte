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
	import { invalidate, invalidateAll } from '$app/navigation';
	import UploadFile from '$lib/components/UploadFile.svelte';

	let { eventData } = $props();

	let currentPhase = $derived(Number(eventData.fase.id_fase));
	let nextPhase = $derived(Number(currentPhase) + 1);

	let nuevoRequisito = $state('');
	let nuevaHistoria = $state('');
	let nuevaCotizacion = $state('');
	let nuevaOc = $state('');
	let nuevaObeservacion = $state('');

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
		return async ({ result, update }: any) => {
			selectedOp.clear();
			isSubmitting = false;

			if (result.type === 'success') {
				// Reiniciar estado reactivo vinculado (bind:value)
				nuevoRequisito = '';
				nuevaHistoria = '';
				nuevaCotizacion = '';
				nuevaOc = '';
				nuevaObeservacion = '';

				// Reiniciar modificadores de UI
				submitUpdate = false;
				submitCancel = false;

				await update({ reset: true });
			}

			await invalidateAll();
		};
	}
</script>

<form
	method="POST"
	action="/oportunidades?/updateOp"
	enctype="multipart/form-data"
	use:enhance={() => {
		isSubmitting = true;
		return handleSubmit();
	}}
>
	<div class="actions">
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
			{:else if currentPhase == 5}
				<FormInput
					label="Estado de entrega / Incidencias"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder="Reporte de recepción y novedades"
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
					<UploadFile label="Documentos de operacion" name="docOpFile" required />
				</div>
				<DatePicker title="Salida de paquete" />
			{/if}
		{/if}
	</div>
	<!-- opciones para envio de formulario -->
	{#if currentPhase != 6 && currentPhase != 0}
		<!-- acciones opcionales -->
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
			<DatePicker title="Fecha Seguimiento" />
		{:else if submitCancel}
			<FormInput
				label="Pérdida"
				name="nuevaHistoria"
				bind:value={nuevaHistoria}
				placeholder="Motivo de la pérdida"
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
					<FormOptionalInput title="+adjuntos">
						<UploadFile label="Subir documentos" name="docFile" multiple />
					</FormOptionalInput>
				</div>
			</div>
		{/if}
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

	<!-- datos compuestos -->
	<input type="hidden" name="id" value={eventData.id} />
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
	{#if nuevaObeservacion}
		<input
			type="hidden"
			name="observaciones"
			value={combinarHistoria(eventData.observaciones, nuevaObeservacion)}
		/>
	{/if}
	{#if eventData.agente}
		<input type="hidden" name="agente" value={eventData.agente.nombre} />
	{/if}
	{#if nextPhase == 6}
		<input type="hidden" name="fecha_cierre" value={new Date().toISOString()} />
	{/if}
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
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
	.cotizacion,
	.oc,
	.opcional {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
	.opciones {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
	}
</style>
