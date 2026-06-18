<script lang="ts">
	import DatePicker from '$lib/components/DatePicker.svelte';
	import FormOptionalSubmit from '$lib/components/FormOptionalSubmit.svelte';
	import FormOptionalInput from '$lib/components/FormOptionalInput.svelte';
	import { getStyleForPhase } from '$lib/utils/util';
	import { fases, motivosOportunidad } from '$lib';
	import FormSelectMotivo from '$lib/components/FormSelectMotivo.svelte';
	import FormInput from '../FormInput.svelte';
	import UploadFile from '$lib/components/UploadFile.svelte';
	import { agregarEntrada, concatStrings } from '$lib/utils/cardActions';
	import FormActions from '../FormActions.svelte';
	import CotizacionNueva from '../Documentos/CotizacionNueva.svelte';

	let { eventData, isEditing = $bindable() }: { eventData: any; isEditing?: boolean } = $props();

	let currentPhase = $derived(Number(eventData.fase.id_fase));
	let nextPhase = $derived(Number(currentPhase) + 1);

	let nuevoRequisito = $state('');
	let nuevaHistoria = $state('');
	let nuevaCotizacion = $state('');
	let nuevaObeservacion = $state('');
	let monto_oc = $state('');
	let cotizaciones = $state([]);

	let necesidades = $state('');
	let potencial_venta = $state(eventData.potencial_venta || '');
	let objetivo = $state('');

	let isOpen = $state(false);
	let submit = $state(false);
	let canSubmit = $state(false);
	let submitUpdate = $state(false);
	let submitCancel = $state(false);
	let style = $derived(getStyleForPhase(currentPhase + 1));

	let fasePlaceholder = $derived(
		fases.find((f) => f.id_fase == currentPhase)?.placeholder ?? 'Ingresa la acción realizada'
	);

	// Callback para resetear el estado local tras un envío exitoso
	function handleSuccess() {
		nuevoRequisito = '';
		nuevaHistoria = '';
		nuevaCotizacion = '';
		nuevaObeservacion = '';
	}
</script>

{#if currentPhase <= 3 && currentPhase != 0 && currentPhase != 6}
	<FormActions action="/oportunidades?/update" bind:isOpen onSuccess={handleSuccess}>
		{#snippet fieldsContent()}
			{#if submit}
				{#if currentPhase == 1}
					<FormSelectMotivo
						title="Especificar Motivo"
						list={motivosOportunidad}
						disableCustom={false}
					/>
					<FormInput
						label="Objetivo"
						name="objetivo"
						bind:value={objetivo}
						placeholder="Especificar Objetivo"
						type="text"
						required
					/>
					<FormInput
						label="Necesidad"
						name="necesidades"
						bind:value={necesidades}
						placeholder="Requerimiento técnico u operacional detectados"
						type="textarea"
						required
					/>
					<FormInput
						label="Potencial de venta"
						name="potencial_venta"
						bind:value={potencial_venta}
						placeholder="Producto o servicio que tiene mayor probabilidad de venta"
						type="textarea"
						required
					/>
				{:else if currentPhase == 2}
					<FormSelectMotivo
						title="Especificar Motivo"
						list={motivosOportunidad}
						disableCustom={false}
					/>
					<FormInput
						label="Análisis"
						name="nuevaHistoria"
						bind:value={nuevaHistoria}
						placeholder={fasePlaceholder}
						type="textarea"
						required
					/>
					<div class="cotizacion">
						<CotizacionNueva label="Cotizaciones" required bind:cotizaciones />
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
								<UploadFile label="Subir documentos" name="adjuntos" multiple />
							</FormOptionalInput>
						</div>
					</div>
					<DatePicker title="Fecha seguimiento o Expiración" />
					<input type="hidden" name="fecha_negociacion" value={new Date().toISOString()} />
				{:else if currentPhase == 3}
					<FormInput
						label={eventData.fase.actual}
						name="nuevaHistoria"
						bind:value={nuevaHistoria}
						placeholder={fasePlaceholder}
						type="textarea"
						required
					/>
					<FormInput
						label="Monto"
						name="monto_oc"
						value={monto_oc}
						placeholder="Monto especificado en la orden de compra"
						type="number"
						required
					/>
					<div class="oc">
						<UploadFile label="Cotizacion generada en Contpaqi" name="quoteWonFile" required />
					</div>
					<div class="oc">
						<UploadFile label="Orden de compra del cliente" name="oc_cliente" required />
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
					<DatePicker title="Seguimiento / Envío" />
					<input type="hidden" name="fecha_pedido" value={new Date().toISOString()} />
				{/if}
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
			<div class="submit">
				{#if !submit && !submitCancel}
					<button type="button" class="butter {isEditing}" onclick={() => (isEditing = !isEditing)}>
						Editar
					</button>
				{/if}
				<FormOptionalSubmit
					nextFase={eventData.fase.accion}
					bind:submit
					bind:submitCancel
					bind:isOpen
				/>

				{#if submit}
					<input type="hidden" name="fase" value={nextPhase} />
					<button type="submit" class="butter" {style} disabled={isSubmitting || canSubmit}>
						{isSubmitting ? 'Procesando...' : eventData.fase.accion}
					</button>
				{:else if submitUpdate}
					<input type="hidden" name="fase" value={currentPhase} />
					<button type="submit" class="butter" disabled={isSubmitting || canSubmit}
						>Actualizar</button
					>
				{:else if submitCancel}
					<input type="hidden" name="fase" value={0} />
					<button type="submit" class="butter" disabled={isSubmitting || canSubmit}>Perder</button>
				{/if}
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
	.true {
		background-color: var(--color-highlight);
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
