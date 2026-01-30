<script lang="ts">
	import { enhance } from '$app/forms';
	import InputField from './InputField.svelte';
	import DatePicker from './DatePicker.svelte';
	import FormOptional from './FormOptional.svelte';
	import { getDurationForPhase, getStyleForPhase } from '$lib/utils/util';
	import { fases, motivosOportunidad } from '$lib';
	import FormOptionalInput from './FormOptionalInput.svelte';
	import FormSelectInput from './FormSelectInput.svelte';

	let {
		fase,
		id,
		historia = '',
		cotizaciones,
		onSuccess = () => {}
	}: {
		fase: any;
		id: string;
		historia?: string;
		cotizaciones?: string;
		onSuccess?: () => void;
	} = $props();

	let nextPhase = $derived(Number(fase.id) + 1);
	let nuevaHistoria = $state('');
	let nuevaCotizacion = $state('');
	let requisitos = $state('');
	let isSubmitting = $state(false);
	let submitUpdate = $state(false);
	let submitCancel = $state(false);

	let style = getStyleForPhase(fase.id + 1);
	let duration = getDurationForPhase(fase.id);

	// Placeholder dinámico por fase
	let fasePlaceholder = $derived(
		fases.find((f) => f.id == fase.id)?.placeholder ?? 'Ingresa la acción realizada'
	);

	function combinarHistoria(anterior: string, nueva: string): string {
		if (!anterior || anterior.trim() === '') return nueva;
		return `${anterior}, ${nueva}`;
	}

	function handleSubmit() {
		return async ({ result }: any) => {
			isSubmitting = false;
			if (result.type === 'success') {
				nuevaHistoria = '';
				nuevaCotizacion = '';
				onSuccess();
			}
		};
	}
</script>

<section class="actions">
	<form
		method="POST"
		action="?/update"
		use:enhance={() => {
			isSubmitting = true;
			return handleSubmit();
		}}
	>
		<input type="hidden" name="id" bind:value={id} />
		<input type="hidden" name="historia" value={combinarHistoria(historia, nuevaHistoria)} />
		<input
			type="hidden"
			name="cotizaciones"
			value={combinarHistoria(cotizaciones, nuevaCotizacion)}
		/>

		{#if !submitCancel && !submitUpdate}
			{#if fase.id >= 2 || fase.id == 0}
				<section class="historia">
					<label>Historia</label>
					<p>{historia}</p>
				</section>
				{#if requisitos}
					<section class="requisitos">
						<label>Requisitos</label>
						<p>{requisitos}</p>
					</section>
				{/if}
			{:else if fase.id >= 3}
				<section class="cotizaciones">
					<label>Cotizaciones</label>
					<p>{cotizaciones}</p>
				</section>
			{/if}

			{#if fase.id == 1}
				<FormSelectInput title="Cambiar Motivo" list={motivosOportunidad} />

				<InputField
					label="Necesidades"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder={fasePlaceholder}
					type="textarea"
					required
				/>

				<FormOptionalInput title="+Agregar requisitos">
					<InputField
						label="Requisitos"
						name="requisitos"
						bind:value={requisitos}
						placeholder="Viáticos, hospedaje, transporte, permisos de acceso, equipo de seguridad, herramientas especiales u otros requerimientos operativos"
						type="textarea"
						required
					/>
				</FormOptionalInput>
				<DatePicker {duration} title="Fecha de compromiso para presentar propuesta" />
			{:else if fase.id == 2}
				<InputField
					label="Análisis"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder={fasePlaceholder}
					type="textarea"
					required
				/>

				<InputField
					label="ID cotización"
					name="nuevaCotizacion"
					bind:value={nuevaCotizacion}
					placeholder="ID de la cotización generada en CONTPAQi"
					type="text"
					required
				/>
				<DatePicker {duration} title="Fecha en que la vigencia de la cotización termina" />
			{:else if fase.id == 3}
				<InputField
					label={fase.actual}
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder={fasePlaceholder}
					type="textarea"
					required
				/>
				<FormOptionalInput title="+Nueva cotizacion">
					<InputField
						label="ID cotización"
						name="nuevaCotizacion"
						bind:value={nuevaCotizacion}
						placeholder="ID Separado(s) por coma y espacio ej. c1, c2, ..."
						type="textarea"
						required
					/>
				</FormOptionalInput>
				<DatePicker {duration} title="Fecha en que la vigencia de la cotización termina" />
			{:else if fase.id != 6}
				<InputField
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

		{#if fase.id != 0}
			{#if submitUpdate}
				<InputField
					label="Postergar"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder="Motivo de la postergación"
					type="textarea"
					required
				/>
			{:else if submitCancel}
				<InputField
					label="Pérdida"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder="Motivo de la pérdida"
					type="textarea"
					required
				/>
			{/if}
		{/if}
		{#if fase.id != 6}
			<div class="submit">
				<FormOptional bind:submitUpdate bind:submitCancel />

				{#if submitUpdate}
					<input type="hidden" name="fase" bind:value={fase.id} />
					<button type="submit" class="butter" disabled={isSubmitting}>Actualizar</button>
				{:else if submitCancel}
					<input type="hidden" name="fase" value={0} />
					<button type="submit" class="butter" disabled={isSubmitting}>Perder</button>
				{:else}
					<input type="hidden" name="fase" bind:value={nextPhase} />
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
