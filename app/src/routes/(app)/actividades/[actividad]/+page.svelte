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
	console.log(actividad);

	// ESTADO
	let editando = $state(false);
	let fase = $derived(fasesActividad[actividad.fase == 6 ? actividad.fase - 4 : actividad.fase]);
</script>

{#if actividad}
	<Card headerStyle={fase.estilo}>
		{#snippet header()}
			<h1>{actividad.motivo}</h1>
			<div class="meta">
				<p class="date">{actividad.inicio}</p>
				<p>|</p>
				<p>{actividad?.agente?.nombre}</p>
				<p>Fase: <strong>{fase.actual}</strong></p>
			</div>
		{/snippet}

		{#snippet content()}
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
				<div class="header">
					<h3>Historia:</h3>
				</div>
				<div class="content">
					<Entradas
						{editando}
						historia={actividad?.historia}
						objId={actividad?.id}
						action={'/actividades?/update'}
					/>
				</div>
			</section>
			<ActivityActions {actividad} bind:editando />
		{/snippet}
	</Card>
{/if}

<style>
	.meta {
		display: flex;
		gap: var(--a);
	}
</style>
