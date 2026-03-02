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

	let {
		fase,
		id,
		historia,
		cotizaciones,
		requisitos
	}: {
		fase: any;
		id: string;
		historia: string;
		cotizaciones: string;
		requisitos: string;
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

	$effect(() => console.log(combinarHistoria(requisitos, nuevoRequisito)));
</script>

<section class="actions">
	<form
		method="POST"
		action="?/updateOp"
		use:enhance={() => {
			isSubmitting = true;
			return handleSubmit();
		}}
	>
		<input type="hidden" name="id" bind:value={id} />
		{#if nuevaHistoria}
			<input type="hidden" name="historia" value={combinarHistoria(historia, nuevaHistoria)} />
		{/if}
		{#if nuevoRequisito}
			<input type="hidden" name="requisitos" value={combinarHistoria(requisitos, nuevoRequisito)} />
		{/if}
		{#if nuevaCotizacion}
			<input
				type="hidden"
				name="cotizaciones"
				value={combinarHistoria(cotizaciones, nuevaCotizacion)}
			/>
		{/if}

		{#if !submitCancel && !submitUpdate}
			{#if fase.id_fase >= 2 || fase.id_fase == 0}
				<section class="historia">
					<h3>Historia</h3>
					<p>{historia}</p>
				</section>
			{/if}
			{#if fase.id_fase >= 3}
				<section class="cotizaciones">
					<h3>Cotizaciones</h3>
					<p>{cotizaciones}</p>
				</section>
			{/if}
			{#if requisitos}
				<!-- <EditableField id="requisitos" name="requisitos" type="text" bind:value={requisitos} /> -->
				<section class="requisitos">
					<h3>Requisitos</h3>
					<p>{requisitos}</p>
				</section>
			{/if}

			{#if fase.id_fase == 1}
			<FormOptionalInput title="+Cambiar Motivo">
				<FormSelectMotivo title="Cambiar Motivo" list={motivosOportunidad} />
			</FormOptionalInput>
				<FormInput
					label="Necesidades"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder={fasePlaceholder}
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
				<FormInput
					label="ID cotización"
					name="nuevaCotizacion"
					bind:value={nuevaCotizacion}
					placeholder="ID de la cotización generada en CONTPAQi"
					type="text"
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
				<FormOptionalInput title="+Nueva cotizacion">
					<FormInput
						label="ID cotización"
						name="nuevaCotizacion"
						bind:value={nuevaCotizacion}
						placeholder="ID Separado(s) por coma y espacio ej. c1, c2, ..."
						type="textarea"
						required
					/>
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
