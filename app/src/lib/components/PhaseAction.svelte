<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { appState } from '$lib/stores/appState.svelte';
	import InputField from './InputField.svelte';
	import DatePicker from './DatePicker.svelte';
	import FormOptional from './FormOptional.svelte';
	import { getDurationForPhase, getStyleForPhase } from '$lib/utils/util';

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

	let isSubmitting = $state(false);
	let submitUpdate = $state(false);
	let submitCancel = $state(false);
	let style = getStyleForPhase(fase);
	let duration = getDurationForPhase(fase.id);
	function combinarHistoria(anterior: string, nueva: string): string {
		if (!anterior || anterior.trim() === '') return nueva;
		return `${anterior}, ${nueva}`;
	}

	function handleSubmit() {
		return async ({ result }: any) => {
			isSubmitting = false;
			if (result.type === 'success') {
				await invalidate('app:data');
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
					<h3>Historia</h3>
					<p>{historia}</p>
				</section>
			{:else if fase.id >= 3}
				<section class="cotizaciones">
					<h3>Cotizaciones</h3>
					<p>{cotizaciones}</p>
				</section>
			{/if}

			{#if fase.id == 0}
				<InputField
					label="Recuperar"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder="Ingresa la acción realizada"
					type="text"
					required
				/>
			{:else if fase.id == 1}
				<InputField
					label="Necesidades"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder="Ingresa la acción realizada"
					type="textarea"
					required
				/>
			{:else if fase.id == 2}
				<InputField
					label="Análisis"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder="Ingresa la acción realizada"
					type="textarea"
					required
				/>
				<InputField
					label="ID cotizacion"
					name="nuevaCotizacion"
					bind:value={nuevaCotizacion}
					placeholder="Ingresa el ID de la cotizacion genereada en contpaqi"
					type="textarea"
					required
				/>
			{:else if fase.id == 3}
				<InputField
					label="Negociacion"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder="Ingresa motivo de la negociación"
					type="textarea"
					required
				/>
			{:else if fase.id == 4}
				<InputField
					label="Proceso de envio"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder="Ingresa la acción realizada"
					type="textarea"
					required
				/>
			{:else if fase.id == 5}
				<InputField
					label="Confirmacion de recibido y cierre de oportunidad"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder="Ingresa la acción realizada"
					type="textarea"
					required
				/>
			{/if}
		{/if}

		{#if fase.id != 0}
			<FormOptional bind:submitUpdate bind:submitCancel>
				{#if submitUpdate}
					<InputField
						label="Postergar"
						name="nuevaHistoria"
						bind:value={nuevaHistoria}
						placeholder="Ingresa el motivo"
						type="textarea"
						required
					/>
				{:else if submitCancel}
					<InputField
						label="Perdida"
						name="nuevaHistoria"
						bind:value={nuevaHistoria}
						placeholder="Ingresa el motivo"
						type="textarea"
						required
					/>
				{/if}
			</FormOptional>
		{/if}

		<DatePicker {duration} title={'Fecha de compromiso'} />

		{#if submitUpdate}
			<input type="hidden" name="fase" bind:value={fase.id} />
			<button type="submit" class="butter" disabled={isSubmitting}> Actualizar </button>
		{:else if submitCancel}
			<input type="hidden" name="fase" value={7} />
			<button type="submit" class="butter" disabled={isSubmitting}> Perder </button>
		{:else}
			<input type="hidden" name="fase" bind:value={nextPhase} />
			<button type="submit" class="butter" {style} disabled={isSubmitting}>
				{isSubmitting ? 'Procesando...' : fase.accion}
			</button>
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
		justify-content: end;
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
</style>
