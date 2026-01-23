<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { appState } from '$lib/stores/appState.svelte';
	import InputField from './InputField.svelte';
	import DatePicker from './DatePicker.svelte';
	import FormOptional from './FormOptional.svelte';

	let {
		fase,
		id,
		historia = '',
		cotizaciones,
		onSuccess = () => {}
	}: {
		fase: {
			id: number;
			actual: string;
			accion?: string;
		};
		id: string;
		historia?: string;
		cotizaciones?: string;
		onSuccess?: () => void;
	} = $props();

	let nextPhase = $derived(Number(fase.id) + 1);
	let nuevaHistoria = $state('');
	let nuevaCotizacion = $state('');
	let nuevoEnvio = $state('');
	let isSubmitting = $state(false);
	let submitType = $state(true);
	let style = $derived.by(() => {
		const colorMap = {
			'0': 'background-color: var(--color-perdida); color: var(--color-text);',
			'1': 'background-color: var(--color-analizar); color: var(--color-text);',
			'2': 'background-color: var(--color-cotizar); color: var(--color-text);',
			'3': 'background-color: var(--color-ganada); color: var(--color-text);',
			'4': 'background-color: var(--color-enviar); color: var(--color-text);',
			'5': 'background-color: var(--color-finalizar); color: white;'
		};
		return colorMap[fase.id] || 'background-color: var(--color-prospecto);';
	});

	function combinarHistoria(anterior: string, nueva: string): string {
		if (!anterior || anterior.trim() === '') return nueva;
		return `${anterior}, ${nueva}`;
	}

	function handleSubmit() {
		return async ({ result }: any) => {
			isSubmitting = false;
			if (result.type === 'success') {
				await invalidate('app:data');
				appState.toggleCalendarView();
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
		{#if fase.id > 1}
			<section class="historia">
				<h3>Historia</h3>
				<p>{historia}</p>
			</section>
		{/if}
		{#if fase.id > 2}
			<section class="cotizaciones">
				<h3>Cotizaciones</h3>
				<p>{cotizaciones}</p>
			</section>
			{#if fase.id == 2}
				<FormOptional buttonText="Actualizar" bind:submitType>
					<InputField
						label="Nueva Cotizacion"
						name="nuevaCotizacion"
						bind:value={nuevaCotizacion}
						placeholder="Ingresa ID de la cotizacion generada en contpaqi"
						type="text"
						required
					/>
				</FormOptional>
			{/if}
		{/if}

		<DatePicker duration={30} title={'Fecha de compromiso'} />
		{#if fase.id == 0}
			<InputField
				label="Perdida"
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
				type="text"
				required
			/>
		{:else if fase.id == 2}
			<InputField
				label="Análisis"
				name="nuevaHistoria"
				bind:value={nuevaHistoria}
				placeholder="Ingresa la acción realizada"
				type="text"
				required
			/>
		{:else if fase.id == 3}
			<InputField
				label="Negociacion"
				name="nuevaHistoria"
				bind:value={nuevaHistoria}
				placeholder="Ingresa motivo de la negociación"
				type="text"
				required
			/>
		{:else if fase.id == 4}
			<InputField
				label="Proceso de envio"
				name="nuevaHistoria"
				bind:value={nuevaHistoria}
				placeholder="Ingresa la acción realizada"
				type="text"
				required
			/>
		{:else if fase.id == 5}
			<InputField
				label="Confirmacion de recibido y cierre de oportunidad"
				name="nuevaHistoria"
				bind:value={nuevaHistoria}
				placeholder="Ingresa la acción realizada"
				type="text"
				required
			/>
		{/if}

		{#if submitType}
			<input type="hidden" name="fase" bind:value={nextPhase} />
			<button type="submit" class="butter" {style} disabled={isSubmitting || !nuevaHistoria.trim()}>
				{isSubmitting ? 'Procesando...' : fase.accion}
			</button>
		{:else}
			<input type="hidden" name="fase" bind:value={fase.id} />
			<button type="submit" class="butter" disabled={isSubmitting || !nuevaCotizacion.trim()}>
				Actualizar
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
