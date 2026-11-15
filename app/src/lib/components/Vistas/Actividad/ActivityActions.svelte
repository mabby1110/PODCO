<script lang="ts">
	import { getStyleForPhase } from '$lib/utils/util';
	import ActivityOptionalSubmit from './ActivityOptionalSubmit.svelte';
	import { agregarEntrada, concatStrings } from '$lib/utils/cardActions';
	import FormActions from '$lib/components/Formularios/FormActions.svelte';
	import FormInput from '$lib/components/Formularios/FormInput.svelte';
	import { fasesActividad } from '$lib';
	import FormOptionalSubmit from '$lib/components/Formularios/FormOptionalSubmit.svelte';

	let {
		actividad,
		editando = $bindable()
	}: {
		actividad: any;
		editando?: boolean;
	} = $props();

	let fase = $derived(fasesActividad[actividad.fase]);
	let siguienteFase = $derived(fasesActividad[actividad.fase + 1]);

	let nuevoRequisito = $state('');
	let nuevaHistoria = $state('');
	let nuevaObservacion = $state('');

	let isOpen = $state(false);
	let isSubmitting = $state(false);
	let submit = $state(false);
	let submitCancel = $state(false);
	let newOp = $state(false);

	function handleSuccess() {
		nuevoRequisito = '';
		nuevaHistoria = '';
	}
</script>

{#if fase.id_fase != 0 && fase.id_fase != 2}
	<FormActions action="/actividades?/update" bind:isOpen onSuccess={handleSuccess}>
		{#snippet hiddenContent()}
			<input type="hidden" name="id" value={actividad.id} />
			{#if nuevaHistoria}
				{actividad?.agente.nombre}
				<input
					type="hidden"
					name="historia"
					value={agregarEntrada(actividad.historia, nuevaHistoria, actividad?.agente)}
				/>
			{/if}
			{#if nuevoRequisito}
				<input
					type="hidden"
					name="requisitos"
					value={concatStrings(actividad.requisitos, nuevoRequisito)}
				/>
			{/if}
			{#if nuevaObservacion}
				<input
					type="hidden"
					name="observaciones"
					value={concatStrings(actividad.observaciones, nuevaObservacion)}
				/>
			{/if}
			{#if fase.id_fase == 2 && submit}
				<input type="hidden" name="fecha_cierre" value={new Date().toISOString()} />
			{/if}
		{/snippet}

		{#snippet inputs()}
			{#if submit}
				{#if fase.id_fase == 1}
					<FormInput
						label="Conclusión (opcional)"
						name="observaciones"
						bind:value={nuevaHistoria}
						placeholder="Resultados técnicos, potencial detectado y acuerdos de seguimiento."
						type="textarea"
					/>
				{/if}
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
		{/snippet}

		{#snippet submitContent()}
			<FormOptionalSubmit
				{fase}
				listaFases={fasesActividad}
				bind:submit
				bind:submitCancel
				bind:isOpen
			/>
			{#if !submit && !submitCancel}
				<button
					type="button"
					class="honey accion {editando}"
					onclick={() => (editando = !editando)}
				>
					Editar
				</button>
			{/if}
			{#if submit}
				<input type="hidden" name="fase" value={2} />
				<button
					type="submit"
					class="honey accion"
					disabled={isSubmitting}
					style={siguienteFase.estilo}
				>
					{isSubmitting ? 'Procesando...' : 'Finzalizar'}
				</button>
			{:else if newOp}
				<button type="submit" class="honey accion" disabled={isSubmitting}>
					{isSubmitting ? 'Procesando...' : 'Crear Oportunidad'}
				</button>
			{:else if submitCancel}
				<input type="hidden" name="fase" value={0} />
				<button type="submit" class="honey accion" disabled={isSubmitting}
					>Cancelar Actividad</button
				>
			{/if}
		{/snippet}
	</FormActions>
{/if}

<style>
	.butter:disabled {
		opacity: 0.2;
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
