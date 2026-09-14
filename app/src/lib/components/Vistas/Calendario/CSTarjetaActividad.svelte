<script lang="ts">
	import { goto } from '$app/navigation';
	import { fasesActividad } from '$lib';
	import { draggable } from '$lib/actions/dnd';
	import { appState } from '$lib/stores/appState.svelte';

	let { actividad, expanded, style } = $props();

	// Estado
	let fase = $derived(fasesActividad[actividad.fase == 6 ? actividad.fase - 4 : actividad.fase]);
	const isDndEnabled = $derived($appState.dnd);
</script>

<div
	class="tarjeta-actividad"
	style="{style} {fase?.estilo}"
	use:draggable={{ data: actividad.id, enabled: isDndEnabled }}
>
	{#if $appState.calendarCards}
		<div class="header">
			<p class="date">{actividad?.inicio.split(' ')[1]}</p>
			<b class="title">{actividad?.motivo}</b>
			<div class="meta">
				<b>{actividad?.agentes?.nombre}</b>
			</div>
			<p class="motivo">{actividad?.objetivo}</p>
		</div>
	{:else}
		<div class="header">
			<b class="title">{actividad?.motivo}</b>
			<div class="meta">
				<b>{actividad?.agentes?.nombre}</b>
			</div>
			<p class="motivo">{actividad?.objetivo}</p>
		</div>
	{/if}
	{#if expanded}
		<button class="butter" onclick={() => goto(`/actividades/${actividad.id}`)}> Ver </button>
	{/if}
</div>

<style>
	.tarjeta-actividad {
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
		width: 100%;
		border: 1px solid var(--color-muted);
		border-radius: var(--a);
		padding: 4px var(--a);
		text-align: left;
		align-items: flex-start;
		backdrop-filter: blur(16px);
		overflow: hidden;
		z-index: 1;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		pointer-events: auto;
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
	.title {
		width: 80%;
	}
	.meta {
		display: flex;
		font-size: smaller;
		gap: var(--a);
	}
	.date {
		position: absolute;
		top: 0;
		right: 0;
		font-size: smaller;
	}
	.meta {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
	.butter {
		align-self: flex-end;
	}
</style>
