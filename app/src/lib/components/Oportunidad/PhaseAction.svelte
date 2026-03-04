<script lang="ts">
	import { enhance } from '$app/forms';
	import DatePicker from '$lib/components/DatePicker.svelte';
	import FormOptionalSubmit from '$lib/components/FormOptionalSubmit.svelte';
	import FormOptionalInput from '$lib/components/FormOptionalInput.svelte';
	import { getDurationForPhase, getStyleForPhase } from '$lib/utils/util';
	import { fases, motivosOportunidad } from '$lib';
	import FormSelectMotivo from '$lib/components/FormSelectMotivo.svelte';
	import FormInput from '../FormInput.svelte';
	import { selectedOp } from '$lib/stores/selectedOp';
	import { invalidate } from '$app/navigation';
	import UploadFile from '../ServerActions/UploadFile.svelte';

	let {
		fase,
		id,
		historia,
		cotizaciones,
		requisitos,
		adjuntos
	}: {
		fase: any;
		id: string;
		historia: string;
		cotizaciones: string;
		requisitos: string;
		adjuntos: string;
	} = $props();

	let nextPhase = $derived(Number(fase.id_fase) + 1);
	let nuevoRequisito = $state('');
	let nuevaHistoria = $state('');
	let nuevaCotizacion = $state('');
	let isSubmitting = $state(false);
	let submitUpdate = $state(false);
	let submitCancel = $state(false);
	let style = $derived(getStyleForPhase(fase.id_fase + 1));
	let duration = $derived(getDurationForPhase(fase.id_fase));

	// Placeholder dinámico por fase
	let fasePlaceholder = $derived(
		fases.find((f) => f.id_fase == fase.id_fase)?.placeholder ?? 'Ingresa la acción realizada'
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
			}
			await invalidate('app:data');
		};
	}

	// $effect(() => console.log(JSON.parse(cotizaciones)));
</script>

<section class="actions">
	<form
		method="POST"
		action="?/updateOp"
		enctype="multipart/form-data"
		use:enhance={() => {
			isSubmitting = true;
			return handleSubmit();
		}}
	>
		{#if !submitCancel && !submitUpdate}
			<!-- informacion -->
			{#if historia}
				<section class="historia">
					<h3>Historia</h3>
					<p>{historia}</p>
				</section>
			{/if}
			{#if cotizaciones}
				<section class="cotizaciones">
					<h3>Cotizaciones</h3>
					{#each JSON.parse(cotizaciones) as cotizacion}
						<div class="cotizacion">
							<a href={cotizacion.url}>{cotizacion.id}</a>
						</div>
					{/each}
				</section>
			{/if}
			{#if requisitos}
				<section class="requisitos">
					<h3>Requisitos</h3>
					<p>{requisitos}</p>
				</section>
			{/if}
			{#if adjuntos}
				<section class="documentos">
					<h3>Documentos</h3>
					{#each JSON.parse(adjuntos) as documento}
						<div class="cotizacion">
							<a href={documento.url}>{documento.id}</a>
						</div>
					{/each}
				</section>
			{/if}

			<!-- Acciones -->
			{#if fase.id_fase == 1}
				<FormSelectMotivo title="Cambiar Motivo" list={motivosOportunidad} />
				<FormInput
					label="Necesidades"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder={fasePlaceholder}
					type="textarea"
					required
				/>
				<FormOptionalInput title="+requisitos">
					<FormInput
						label="Requisitos"
						name="nuevoRequisitos"
						bind:value={nuevoRequisito}
						placeholder="Viáticos, hospedaje, transporte, permisos de acceso, equipo de seguridad, herramientas especiales u otros requerimientos operativos"
						type="textarea"
						required
					/>
				</FormOptionalInput>
				<FormOptionalInput title="+documentos">
					<UploadFile label="Subir documentos" name="docFile" />
				</FormOptionalInput>
				<DatePicker {duration} title="Fecha de compromiso para presentar propuesta" />
			{:else if fase.id_fase == 2}
				<FormInput
					label="Análisis"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder={fasePlaceholder}
					type="textarea"
					required
				/>
				<div class="cotizacion">
					<FormInput
						label="ID cotización"
						name="nuevaCotizacion"
						bind:value={nuevaCotizacion}
						placeholder="ID de la cotización generada en CONTPAQi"
						type="number"
						required
					/>
					<UploadFile label="" name="quotefile" required />
				</div>
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
				<FormOptionalInput title="+documentos">
					<UploadFile label="Subir documentos" name="docFile" />
				</FormOptionalInput>
				<DatePicker {duration} title="Fecha en que la vigencia de la cotización termina" />
			{:else if fase.id_fase == 3}
				<FormInput
					label={fase.actual}
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder={fasePlaceholder}
					type="textarea"
					required
				/>

				<div class="oc">
					<FormInput
						label="Orden de compra"
						name="nuevaCotizacion"
						bind:value={nuevaCotizacion}
						placeholder="ID de la cotización generada en CONTPAQi"
						type="text"
						required
					/>
					<UploadFile label="" name="quotefile" required />
				</div>
				<DatePicker {duration} title="Fecha en que la vigencia de la cotización termina" />
			{:else if fase.id_fase != 6}
				<FormInput
					label={fase.actual}
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder={fasePlaceholder}
					type="textarea"
					required
				/>
				<DatePicker {duration} title="Fecha de compromiso" />
			{/if}
		{/if}

		<!-- acciones opcionales -->
		{#if fase.id_fase != 0}
			{#if submitUpdate}
				<FormInput
					label="Postergar"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder="Motivo de la postergación y acción a realizar"
					type="textarea"
					required
				/>
				{#if fase.id_fase > 2}
					<FormOptionalInput title="+Nueva cotizacion">
						<div class="cotizacion">
							<FormInput
								label="ID cotización"
								name="nuevaCotizacion"
								bind:value={nuevaCotizacion}
								placeholder="ID de la cotización generada en CONTPAQi"
								type="number"
								required
							/>
							<UploadFile label="" name="quotefile" required />
						</div>
					</FormOptionalInput>
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
				{/if}
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

		<!-- opciones para envio de formulario -->
		{#if fase.id_fase != 6}
			<div class="submit">
				<FormOptionalSubmit bind:submitUpdate bind:submitCancel />

				{#if submitUpdate}
					<input type="hidden" name="fase" value={fase.id_fase} />
					<button type="submit" class="butter" disabled={isSubmitting}>Actualizar</button>
				{:else if submitCancel}
					<input type="hidden" name="fase" value={0} />
					<button type="submit" class="butter" disabled={isSubmitting}>Perder</button>
				{:else}
					<input type="hidden" name="fase" value={nextPhase} />
					<button type="submit" class="butter" {style} disabled={isSubmitting}>
						{isSubmitting ? 'Procesando...' : fase.accion}
					</button>
				{/if}
			</div>
		{/if}

		<input type="hidden" name="id" bind:value={id} />
		{#if nuevaHistoria}
			<input type="hidden" name="historia" value={combinarHistoria(historia, nuevaHistoria)} />
		{/if}
		{#if nuevoRequisito}
			<input type="hidden" name="requisitos" value={combinarHistoria(requisitos, nuevoRequisito)} />
		{/if}
		{#if nuevaCotizacion}
			<input type="hidden" name="cotizaciones" bind:value={cotizaciones} />
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
	.cotizacion,
	.oc {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
</style>
