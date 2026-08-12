<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { fases } from '$lib';
	import { draggable } from '$lib/actions/dnd';
	import { appState } from '$lib/stores/appState.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { getStyleForPhase } from '$lib/utils/util';

	let { event, expanded, style } = $props();
	const { agentes } = $derived(page.data);
	const isDndEnabled = $derived($appState.dnd);

	const eventData = $derived.by(() => {
		if (!event) return null;

		return {
			agente: agentes?.find((e: { id: any }) => e.id == event.id_agente) ?? $profile,
			motivo: event?.motivo,
			objetivo: event?.objetivo,
			inicio: event?.inicio,
			fase: fases.find((f) => f.id_fase == event.fase),
			historia: event.historia || 'Sin historial registrado',
			style: getStyleForPhase(event.fase) + style
		};
	});
</script>

<div
	class="tarjeta-actividad"
	style={eventData?.style}
	use:draggable={{ data: event.id, enabled: isDndEnabled }}
>
	{#if $appState.calendarCards}
		<div class="header">
			<p class="date">{eventData?.inicio.split(' ')[1]}</p>
			<b class="title">{eventData?.motivo}</b>
			<div class="meta">
				<b>{eventData?.agente?.nombre}</b>
			</div>
			<p class="motivo">{event?.objetivo}</p>
		</div>
	{:else}
		<div class="header">
			<b class="title">{eventData?.motivo}</b>
			<div class="meta">
				<b>{eventData?.agente?.nombre}</b>
			</div>
			<p class="motivo">{event?.objetivo}</p>
		</div>
	{/if}
	{#if expanded}
		<button class="butter" onclick={() => goto(`/actividades/${event.id}`)}> Ver </button>
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
