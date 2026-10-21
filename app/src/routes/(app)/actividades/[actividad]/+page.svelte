<script lang="ts">
	import { page } from '$app/state';
	import { fasesActividad } from '$lib';
	import Entradas from '$lib/components/Acciones/Entradas.svelte';
	import CustomInput from '$lib/components/Formularios/CustomInput.svelte';
	import DatePicker from '$lib/components/Formularios/DatePicker.svelte';
	import EditableInput from '$lib/components/Formularios/EditableInput.svelte';
	import Card from '$lib/components/Tarjetas/Card.svelte';
	import ActivityActions from '$lib/components/Vistas/Actividad/ActivityActions.svelte';

	const actividad = $derived(page.data.actividad);

	// ESTADO
	let editando = $state(false);
	let fase = $derived(fasesActividad[actividad.fase == 6 ? actividad.fase - 4 : actividad.fase]);
</script>

{#if actividad}
	<Card headerStyle={fase.estilo}>
		{#snippet header()}
			<div class="card-title">
				<div class="card-content">
					<h1>{actividad.motivo}</h1>
				</div>
				<div class="card-meta">
					<p class="date">{actividad.inicio}</p>
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
				label="Requisitos"
				name="requisitos"
				type="textarea"
				value={actividad.requisitos}
				action="/actividades?/update"
				placeholder="Requisitos"
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
