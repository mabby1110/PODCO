<script lang="ts">
	import DatePicker from '$lib/components/Formularios/DatePicker.svelte';
	import FormActions from '$lib/components/Formularios/FormActions.svelte';
	import FormInput from '$lib/components/Formularios/FormInput.svelte';
	import FormOptionalInput from '$lib/components/Formularios/FormOptionalInput.svelte';
	import FormOptionalSubmit from '$lib/components/Formularios/FormOptionalSubmit.svelte';
	import FormSelectMotivo from '$lib/components/Formularios/FormSelectMotivo.svelte';
	import UploadFile from '$lib/components/Formularios/UploadFile.svelte';
	import { fasesOportunidad, motivosOportunidad } from '$lib';

	let { oportunidad, editando = $bindable(false) }: { oportunidad: any; editando?: boolean } =
		$props();

	// DATOS DERIVADOS
	let cotizaciones = $derived(oportunidad.pedidos.filter((p) => p.fase === 3) || []);

	// ESTADO COMPONENTE
	let fase = $derived(fasesOportunidad[oportunidad.fase]);
	let siguienteFase = $derived(fasesOportunidad[oportunidad.fase + 1]);
	let canSubmit = $state(true);

	let isOpen = $state(false);
	let submit = $state(false);

	let submitCancel = $state(false);
</script>

<FormActions action="/oportunidades?/actualizarOportunidad" bind:isOpen>
	{#snippet hiddenContent()}
		<input type="hidden" name="id" value={oportunidad.id} />
	{/snippet}

	{#snippet inputs()}
		{#if submit}
			{#if fase.id_fase == 1}
				<section>
					<div class="header">
						<h3>Análisis:</h3>
					</div>

					<div class="content">
						<FormSelectMotivo
							title="Especificar Motivo"
							list={motivosOportunidad}
							disableCustom={false}
						/>
						<FormInput
							label="Objetivo"
							name="objetivo"
							placeholder={fase.placeholder_accion}
							type="text"
							required
						/>
						<FormInput
							label="Necesidad"
							name="necesidades"
							placeholder="Requerimiento detectados"
							type="textarea"
							required
						/>
						<DatePicker title="Salida de paquete" />
					</div>
				</section>
			{:else if fase.id_fase == 2}
				<input type="hidden" name="fecha_analisis" value={new Date().toISOString()} />
				<input type="hidden" name="fecha_venta" value={new Date().toISOString()} />
				<input type="number" disabled bind:value={cotizaciones.length} required />
				<FormInput
					label="Motivo"
					name="motivo"
					placeholder="Especificar concepto de la oportunidad"
					type="text"
					required
				/>
				<FormInput
					label="Análisis"
					name="analisis"
					placeholder="Resumen del analisis realizado, justifica la seleccion de producto realizada"
					type="textarea"
					required
				/>
				cotizaciones: {cotizaciones.length}
				<!-- <div class="opcional">
					<h3>Cotizacion(es)</h3>
					<div class="opciones">
						{#if oportunidad.cotizaciones.length > 0}
							{#each oportunidad.cotizaciones as documento}
								<p>{documento.titulo}</p>
							{/each}
						{:else}
							<p>Subir cotizacion para avanzar fase</p>
						{/if}
					</div>
				</div> -->
				<div class="opcional">
					<h3>Informacion adicional</h3>
					<div class="opciones">
						<FormOptionalInput title="+Observaciones">
							<FormInput
								label="Observaciones"
								name="observaciones"
								placeholder="Detalles importantes y pautas a seguir"
								type="textarea"
								required
							/>
						</FormOptionalInput>
						<FormOptionalInput title="+Agregar requisitos">
							<FormInput
								label="Requisitos"
								name="nuevosRequisitos"
								placeholder="Viáticos, hospedaje, transporte, permisos de acceso, equipo de seguridad, herramientas especiales u otros requerimientos operativos"
								type="textarea"
								required
							/>
						</FormOptionalInput>
					</div>
				</div>
				<DatePicker title="Fecha seguimiento o Expiración" />
			{:else if fase.id_fase == 3}
				<FormInput label={oportunidad.fase.actual} name="nuevaHistoria" type="textarea" required />
				<div class="opcional">
					<h3>Orden de compra</h3>
					<div class="opciones">
						{#if oportunidad.occ.length > 0}
							{#each oportunidad.occ as documento}
								<p>{documento.titulo}</p>
							{/each}
						{:else}
							<p>Subir Orden(es) de compra para avanzar fase</p>
						{/if}
					</div>
				</div>
				<div class="opcional">
					<h3>Informacion adicional</h3>
					<div class="opciones">
						<FormOptionalInput title="+Observaciones">
							<FormInput
								label="Observaciones"
								name="observaciones"
								placeholder="Detalles importantes y pautas a seguir"
								type="textarea"
								required
							/>
						</FormOptionalInput>
						<FormOptionalInput title="+Agregar requisitos">
							<FormInput
								label="Requisitos"
								name="nuevosRequisitos"
								placeholder="Viáticos, hospedaje, transporte, permisos de acceso, equipo de seguridad, herramientas especiales u otros requerimientos operativos"
								type="textarea"
								required
							/>
						</FormOptionalInput>
					</div>
				</div>
				<DatePicker title="Seguimiento / Envío" />
				<input type="hidden" name="fecha_pedido" value={new Date().toISOString()} />
			{/if}
		{:else if submitCancel}
			<input type="hidden" name="fecha_cierre" value={new Date().toISOString()} />
			<FormInput
				label="Pérdida"
				name="nuevaHistoria"
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

	{#snippet submitContent(isSubmitting: boolean)}
		{#if fase.id_fase <= 3 && fase.id_fase != 0}
			{#if submit}
				<input type="hidden" name="fase" value={siguienteFase.id_fase} />
				<button
					type="submit"
					class="honey accion"
					style={siguienteFase.estilo}
					disabled={isSubmitting || !canSubmit}
				>
					{isSubmitting ? 'Procesando...' : fase.accion}
				</button>
			{:else if submitCancel}
				<input type="hidden" name="fase" value={0} />
				<button type="submit" class="honey accion" disabled={isSubmitting || !canSubmit}>Descartar</button>
			{:else}
				<button type="button" class="honey accion {editando}" onclick={() => (editando = !editando)}>
					~Editar
				</button>
			{/if}
		{/if}
		<FormOptionalSubmit {siguienteFase} bind:submit bind:submitCancel bind:isOpen />
	{/snippet}
</FormActions>

<style>
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
</style>
