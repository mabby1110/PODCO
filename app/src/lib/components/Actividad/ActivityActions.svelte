<script lang="ts">
	import { enhance } from '$app/forms';
	import DatePicker from '$lib/components/DatePicker.svelte';
	import FormOptionalInput from '$lib/components/FormOptionalInput.svelte';
	import { filtrarPorAgente, getDurationForPhase, getStyleForPhase } from '$lib/utils/util';
	import { motivosOportunidad } from '$lib';
	import FormInput from '../FormInput.svelte';
	import { invalidate } from '$app/navigation';
	import { selectedActivity } from '$lib/stores/selectedActivity';
	import ActivityOptionalSubmit from './ActivityOptionalSubmit.svelte';
	import FormNewClient from '../FormNewClient.svelte';
	import FormSelectMotivo from '../FormSelectMotivo.svelte';
	import Searchbar from '../Searchbar.svelte';
	import { page } from '$app/state';
	import FormConditionalInput from '../FormConditionalInput.svelte';

	let { eventData } = $props();
	let clientes = $derived(page.data.clientes ?? []);
	let profile = $derived(page.data.profile ?? []);
	let potencial_venta = $state('');
	let currentPhase = $derived(Number(eventData.fase.id_fase));
	let nextPhase = $derived(currentPhase + 5);

	let nuevoRequisito = $state('');
	let nuevaHistoria = $state('');
	let nuevaObservacion = $state('');

	let isSubmitting = $state(false);
	let submitOp = $state(false);
	let submitUpdate = $state(false);
	let submitCancel = $state(false);
	let addNewClient = $state(false);

	let style = $derived(getStyleForPhase(currentPhase + 5));
	let duration = $derived(getDurationForPhase(currentPhase));
	let agenteSeleccionado = $state<string>('');

	let clientesFiltrados = $derived(
		profile?.isAdmin
			? agenteSeleccionado
				? filtrarPorAgente(clientes, agenteSeleccionado)
				: clientes
			: filtrarPorAgente(clientes, String(profile?.id))
	);

	function concatStrings(anterior: string, nueva: string): string {
		if (!anterior || anterior.trim() === '') return nueva;
		return `${anterior}, ${nueva}`;
	}

	function handleSubmit() {
		return async ({ result }: any) => {
			selectedActivity.clear();
			isSubmitting = false;
			if (result.type === 'success') {
				nuevaHistoria = '';
			}
			await invalidate('app:data');
		};
	}
</script>

<section class="actions">
	<form
		method="POST"
		action="/actividades?/updateActivity"
		use:enhance={() => {
			isSubmitting = true;
			return handleSubmit();
		}}
	>
		{#if !submitCancel && !submitUpdate && !submitOp}
			{#if currentPhase == 1}
				<FormInput
					label="Seguimiento"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder="Actividades realizadas"
					type="textarea"
					required
				/>
				{#if eventData.tipo_actividad == 2}
					<FormInput
						label="Potencial de venta"
						name="potencial_venta"
						bind:value={potencial_venta}
						placeholder="Areas de oportunidad, equipo actual, producto que maneja, etc."
						type="textarea"
						required
					/>
					<FormNewClient />
				{/if}
				<FormOptionalInput title="+Observaciones">
					<FormInput
						label="Observaciones"
						name="nuevaObservacion"
						bind:value={nuevaObservacion}
						placeholder="Documenta novedades, detalles importantes y pautas a seguir"
						type="textarea"
						required
					/>
				</FormOptionalInput>
			{/if}
		{/if}

		{#if currentPhase != 0}
			{#if submitUpdate}
				<FormInput
					label="Justificación"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder="Motivo de la postergación y acción a realizar"
					type="textarea"
					required
				/>
				<DatePicker {duration} title="Fecha de compromiso" />
			{:else if submitOp}
				<FormSelectMotivo title="Cambiar Motivo" list={motivosOportunidad} disableCustom={false} />
				<div class="action-input">
					{#if addNewClient}
						<FormNewClient />
					{:else}
						<Searchbar data={clientesFiltrados} keyColumns={['razon_social']} />
					{/if}
					<FormConditionalInput
						titleOpen="+cliente"
						titleClose="Cliente existente"
						bind:isOpen={addNewClient}
					/>
				</div>
				<DatePicker {duration} title="Fecha de compromiso" />
				<FormOptionalInput title="+Observaciones">
					<FormInput
						label="Observaciones"
						name="nuevaObservacion"
						bind:value={nuevaObservacion}
						placeholder="Documenta novedades, detalles importantes y pautas a seguir"
						type="textarea"
						required
					/>
				</FormOptionalInput>
			{:else if submitCancel}
				<FormInput
					label="Justificación"
					name="nuevaHistoria"
					bind:value={nuevaHistoria}
					placeholder="Motivo de la cancelación"
					type="textarea"
					required
				/>
			{/if}
		{/if}

		<!-- datos compuestos -->
		<input type="hidden" name="id" value={eventData.id} />
		{#if nuevaHistoria}
			<input
				type="hidden"
				name="historia"
				value={concatStrings(eventData.historia, nuevaHistoria)}
			/>
		{/if}
		{#if nuevoRequisito}
			<input
				type="hidden"
				name="requisitos"
				value={concatStrings(eventData.requisitos, nuevoRequisito)}
			/>
		{/if}
		{#if nuevaObservacion}
			<input
				type="hidden"
				name="observaciones"
				value={concatStrings(eventData.observaciones, nuevaObservacion)}
			/>
		{/if}
		{#if nextPhase == 6}
			<input type="hidden" name="fecha_cierre" value={new Date().toISOString()} />
		{/if}
		{#if eventData.agente}
			<input type="hidden" name="id_agente" value={eventData.agente.id} />
		{/if}
		{#if currentPhase != 6 && currentPhase != 0}
			<div class="submit">
				<ActivityOptionalSubmit bind:submitUpdate bind:submitCancel bind:submitOp />

				{#if submitUpdate}
					<input type="hidden" name="fase" value={currentPhase} />
					<button type="submit" class="butter" disabled={isSubmitting}>Actualizar</button>
				{:else if submitOp}
					<input type="hidden" name="fase" value={nextPhase} />
					<button type="submit" class="butter" {style} disabled={isSubmitting}>
						{isSubmitting ? 'Procesando...' : 'Crear Oportunidad'}
					</button>
				{:else if submitCancel}
					<input type="hidden" name="fase" value={0} />
					<button type="submit" class="butter" disabled={isSubmitting}>Cancelar Actividad</button>
				{:else}
					<input type="hidden" name="fase" value={nextPhase} />
					<button type="submit" class="butter" {style} disabled={isSubmitting}>
						{isSubmitting ? 'Procesando...' : 'Finzalizar'}
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
	.action-input {
		width: 100%;
		display: flex;
		align-items: flex-end;
		gap: var(--a);
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
