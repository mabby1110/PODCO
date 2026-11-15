<script lang="ts">
	import { page } from '$app/state';
	import { fasesActividad } from '$lib';
	import Entradas from '$lib/components/Acciones/Entradas.svelte';
	import CustomInput from '$lib/components/Formularios/CustomInput.svelte';
	import DatePicker from '$lib/components/Formularios/DatePicker.svelte';
	import EditableInput from '$lib/components/Formularios/EditableInput.svelte';
	import FormOptionalInput from '$lib/components/Formularios/FormOptionalInput.svelte';
	import RequisitoDeGastos from '$lib/components/Formularios/RequisitoDeGastos.svelte';
	import Card from '$lib/components/Tarjetas/Card.svelte';
	import ActivityActions from '$lib/components/Vistas/Actividad/ActivityActions.svelte';
	import SubirAdjunto from '$lib/components/Vistas/Documentos/SubirAdjunto.svelte';
	import { formatDateToReadable } from '$lib/utils/util';

	const actividad = $derived(page.data.actividad);

	// ESTADO
	let editando = $state(false);
	let fase = $derived(fasesActividad[actividad.fase == 6 ? 2 : actividad.fase]);
	const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

	let requisitos = $derived(actividad.requisito_gasto ?? []);
	let total = $derived(requisitos.reduce((suma, r) => suma + Number(r.monto), 0));
</script>

{#if actividad}
	<Card headerStyle={fase.estilo}>
		{#snippet header()}
			<div class="card-title">
				<div class="card-content">
					<h1>{actividad.motivo}</h1>
				</div>
				<div class="card-meta">
					<p class="date">{formatDateToReadable(actividad.inicio)}</p>
					<p>|</p>
					<p>{actividad?.agente?.nombre}</p>
					<p>Fase: <strong>{fase.actual}</strong></p>
				</div>
			</div>
		{/snippet}

		{#snippet contenido()}
			<CustomInput action="/actividades?/update" id={actividad.id} {editando}>
				<DatePicker />
			</CustomInput>
			<section>
				<div class="section-header">
					<h3>Requisitos Actuales</h3>
				</div>
				<div class="section-content">
					{#if editando}
						<CustomInput action="/actividades?/update" id={actividad.id} {editando}>
							<RequisitoDeGastos
								llaves={['hospedaje', 'alimentos', 'casetas', 'gasolina', 'otro']}
								name="requisito_gasto"
								requisito_gasto={actividad.requisito_gasto}
							/>
						</CustomInput>
					{:else}
						<div class="pan honey">
							{#each requisitos as requisito, i (i)}
								<p>
									{requisito.concepto}: {pesos.format(requisito.monto)}
									{#if requisito.observaciones}
										<small>({requisito.observaciones})</small>
									{/if}
								</p>
							{:else}
								<p>Sin requisitos registrados.</p>
							{/each}

							{#if requisitos.length}
								<h3>Total: {pesos.format(total)}</h3>
							{/if}
						</div>
					{/if}
				</div>
			</section>
			<EditableInput
				{editando}
				id={actividad.id}
				label="Objetivo"
				name="objetivo"
				type="textarea"
				value={actividad.objetivo}
				action="/actividades?/update"
				placeholder="Objetivo"
			>
				{#snippet header()}
					<input type="hidden" name="id" value={actividad.id} />
				{/snippet}
			</EditableInput>

			<EditableInput
				{editando}
				id={actividad.id}
				label="Observaciones"
				name="observaciones"
				type="textarea"
				value={actividad.observaciones}
				action="/actividades?/update"
				placeholder="Observaciones"
			>
				{#snippet header()}
					<input type="hidden" name="id" value={actividad.id} />
				{/snippet}
			</EditableInput>

			<section>
				<div class="section-header">
					<h3>Historia:</h3>
				</div>
				<div class="section-content">
					<Entradas
						{editando}
						historia={actividad?.historia}
						id_actividad={actividad?.id}
						action={'/actividades?/update'}
					/>
				</div>
			</section>
		{/snippet}

		{#snippet acciones()}
			<ActivityActions {actividad} bind:editando />
		{/snippet}
	</Card>
{/if}
