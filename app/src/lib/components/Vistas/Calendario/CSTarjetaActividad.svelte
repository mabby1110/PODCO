<script lang="ts">
	import { goto } from '$app/navigation';
	import { fasesActividad } from '$lib';
	import { draggable } from '$lib/actions/dnd';
	import { appState } from '$lib/stores/appState.svelte';
	import { formatDateToReadable, obtenerIniciales } from '$lib/utils/util';

	let { actividad, expanded, style } = $props();

	// Estado
	let fase = $derived(fasesActividad[actividad.fase == 6 ? actividad.fase - 4 : actividad.fase]);
	const isDndEnabled = $derived($appState.dnd);
</script>

<div
	class="tarjeta butter"
	class:min={!$appState.calendarCards}
	style="{style} {fase?.estilo}"
	use:draggable={{ data: actividad.id, enabled: isDndEnabled }}
>
	{#if $appState.calendarCards || expanded}
		<div class="header">
			<h3>Actividad: {actividad?.motivo}</h3>
			<div class="meta">
				<b>{actividad?.agentes?.nombre}</b>
			</div>
			<p class="motivo">{actividad?.objetivo}</p>
		</div>
	{:else}
		<div class="header-min">
			<b>{obtenerIniciales(actividad?.agentes?.nombre)}</b>
			<p>{actividad?.objetivo}</p>
		</div>
	{/if}
	{#if expanded}
		<div class="acciones">
			<p class="date">{formatDateToReadable(actividad?.inicio)}</p>
			<button class="butter" onclick={() => goto(`/actividades/${actividad.id}`)}> Ver </button>
		</div>
	{/if}
</div>

<style>
	.tarjeta {
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: var(--a);
		text-align: left;
		align-items: flex-start;
		overflow: hidden;
		z-index: 1;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		cursor: pointer;
	}
	.header {
		position: relative;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: var(--b);
		width: 100%;
	}
	.header-min {
		display: flex;
		align-items: baseline;
		gap: var(--a);
	}
	.acciones {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		width: 100%;
	}
	.min {
		padding: 0;
	}
</style>
