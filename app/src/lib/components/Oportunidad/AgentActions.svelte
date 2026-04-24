<script lang="ts">
	import { enhance } from '$app/forms';
	import DatePicker from '$lib/components/DatePicker.svelte';
	import FormOptionalSubmit from '$lib/components/FormOptionalSubmit.svelte';
	import FormOptionalInput from '$lib/components/FormOptionalInput.svelte';
	import { getStyleForPhase } from '$lib/utils/util';
	import { fases, motivosOportunidad } from '$lib';
	import FormSelectMotivo from '$lib/components/FormSelectMotivo.svelte';
	import FormInput from '../FormInput.svelte';
	import { invalidateAll } from '$app/navigation';
	import UploadFile from '$lib/components/UploadFile.svelte';
	import EditableJsonList from '../EditableJsonList.svelte';
	import { agregarEntrada, concatStrings } from '$lib/utils/cardActions';

	let { eventData } = $props();

	let currentPhase = $derived(Number(eventData.fase.id_fase));
	let nextPhase = $derived(Number(currentPhase) + 1);

	let nuevoRequisito = $state('');
	let nuevaHistoria = $state('');
	let nuevaCotizacion = $state('');
	let nuevaObeservacion = $state('');
	let monto_oc = $state('');

	let necesidad = $state('');
	let potencial_venta = $state('');
	let objetivo = $state('');

	let isSubmitting = $state(false);
	let isOpen = $state(false);
	let submit = $state(false);
	let submitUpdate = $state(false);
	let submitCancel = $state(false);
	let style = $derived(getStyleForPhase(currentPhase + 1));

	// Placeholder dinámico por fase
	let fasePlaceholder = $derived(
		fases.find((f) => f.id_fase == currentPhase)?.placeholder ?? 'Ingresa la acción realizada'
	);

	function handleSubmit() {
		return async ({ result, update }: any) => {
			isSubmitting = false;

			if (result.type === 'success') {
				// Reiniciar estado reactivo vinculado (bind:value)
				nuevoRequisito = '';
				nuevaHistoria = '';
				nuevaCotizacion = '';
				nuevaObeservacion = '';

				// Reiniciar modificadores de UI
				isOpen = false;

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
	{#if currentPhase <= 3 && currentPhase != 0 && currentPhase != 6}
		{#if isOpen}
			<div class="actions">
				{#if submit}
					{#if currentPhase == 1}
						<FormInput
							label="Necesidad"
							name="necesidad"
							bind:value={necesidad}
							placeholder={fasePlaceholder}
							type="textarea"
							required
						/>
						<FormInput
							label="Necesidad"
							name="necesidad"
							bind:value={necesidad}
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
							<UploadFile label="Orden de compra del cliente" name="ocFile" required />
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
				{:else if submitUpdate}
					<h3>Editar informacion</h3>
					<div class="opcional">
						<div class="opciones">
							{#if !eventData.historia}
								<FormOptionalInput title="+Historia">
									<FormInput
										label="Historia"
										name="nuevaHistoria"
										bind:value={nuevaHistoria}
										type="textarea"
										required
									/>
								</FormOptionalInput>
							{:else}
								<EditableJsonList
									jsonList={eventData.historia}
									action="/oportunidades?/updateOp"
									name={'historia'}
									id={eventData.id}
									fields={[
										{ name: 'fecha', label: 'Fecha', type: 'date' },
										{ name: 'entrada', label: 'Entrada', type: 'textarea' }
									]}
								/>
							{/if}
							{#if currentPhase == 3}
								<FormOptionalInput title="+Nueva cotizacion">
									<UploadFile label="Nueva Cotización" name="quoteFile" required />
								</FormOptionalInput>
							{/if}
							<FormOptionalInput title="+Objetivo">
								<FormInput
									label="Objetivo"
									name="objetivo"
									value={eventData.objetivo}
									type="textarea"
									required
								/>
							</FormOptionalInput>
							<FormOptionalInput title="+Observaciones">
								<FormInput
									label="Observaciones"
									name="observaciones"
									value={eventData.observaciones}
									type="textarea"
									required
								/>
							</FormOptionalInput>
							<FormOptionalInput title="+Agregar requisitos">
								<FormInput
									label="Requisitos"
									name="requisitos"
									value={eventData.requisitos}
									placeholder="Viáticos, hospedaje, transporte, permisos de acceso, equipo de seguridad, herramientas especiales u otros requerimientos operativos"
									type="textarea"
									required
								/>
							</FormOptionalInput>
							<FormOptionalInput title="+adjuntos">
								<UploadFile label="Subir documentos" name="docFile" multiple />
							</FormOptionalInput>

							<FormOptionalInput title="+Postergar">
								<div class="opciones">
									<FormInput
										label="Postergar"
										name="nuevaHistoria"
										bind:value={nuevaHistoria}
										placeholder="Motivo de la postergación y acción a realizar"
										type="textarea"
										required
									/>
									<DatePicker title="Fecha Seguimiento" />
								</div>
							</FormOptionalInput>
						</div>
					</div>
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
			</div>
		{/if}

		<!-- datos compuestos -->
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

		<div class="submit">
			<FormOptionalSubmit
				nextFase={eventData.fase.accion}
				bind:submit
				bind:submitUpdate
				bind:submitCancel
				bind:isOpen
			/>

			{#if submit}
				<input type="hidden" name="fase" value={nextPhase} />
				<button type="submit" class="butter" {style} disabled={isSubmitting}>
					{isSubmitting ? 'Procesando...' : eventData.fase.accion}
				</button>
			{:else if submitUpdate}
				<input type="hidden" name="fase" value={currentPhase} />
				<button type="submit" class="butter" disabled={isSubmitting}>Actualizar</button>
			{:else if submitCancel}
				<input type="hidden" name="fase" value={0} />
				<button type="submit" class="butter" disabled={isSubmitting}>Perder</button>
			{/if}
		</div>
	{:else}
		<div class="actions">
			<h3>Editar informacion</h3>
			<div class="opcional">
				<div class="opciones">
					<FormOptionalInput title="+Observaciones">
						<FormInput
							label="Observaciones"
							name="observaciones"
							value={eventData.observaciones}
							type="textarea"
							required
						/>
					</FormOptionalInput>
					<FormOptionalInput title="+Agregar requisitos">
						<FormInput
							label="Requisitos"
							name="requisitos"
							value={eventData.requisitos}
							placeholder="Viáticos, hospedaje, transporte, permisos de acceso, equipo de seguridad, herramientas especiales u otros requerimientos operativos"
							type="textarea"
							required
						/>
					</FormOptionalInput>
					<FormOptionalInput title="+adjuntos">
						<UploadFile label="Subir documentos" name="docFile" multiple />
					</FormOptionalInput>

					<FormOptionalInput title="+Postergar">
						<div class="opciones">
							<FormInput
								label="Postergar"
								name="nuevaHistoria"
								bind:value={nuevaHistoria}
								placeholder="Motivo de la postergación y acción a realizar"
								type="textarea"
								required
							/>
							<DatePicker title="Fecha Seguimiento" />
						</div>
					</FormOptionalInput>
				</div>
			</div>
		</div>

		<!-- datos compuestos -->
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

		<div class="submit">
			<input type="hidden" name="fase" value={currentPhase} />
			<button type="submit" class="butter" disabled={isSubmitting}>Actualizar</button>
		</div>
	{/if}
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
