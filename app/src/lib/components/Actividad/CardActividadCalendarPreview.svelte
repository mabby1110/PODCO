<script lang="ts">
	import { page } from '$app/state';
	import { fases } from '$lib';
	import { draggable } from '$lib/actions/dnd';
	import { appState } from '$lib/stores/appState.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { selectedActivity } from '$lib/stores/selectedActivity';
	import { getStyleForPhase } from '$lib/utils/util';

	let { event, style } = $props();
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

	function select() {
		selectedActivity.set({ ...event });
	}
</script>

<button
	style={eventData?.style}
	use:draggable={{ data: event.id, enabled: isDndEnabled }}
	use:draggable={event.id}
	onclick={select}
	class="preview-container"
>
	{#if $appState.calendarCards}
		<div class="preview-header">
			<p class="header-date">{eventData?.inicio.split(' ')[1]}</p>
			<b class="header-title">{eventData?.motivo}</b>
			<div class="header-meta">
				<b>{eventData?.agente.nombre}</b>
			</div>
		</div>
		<div class="meta">
			<p class="motivo">{event?.objetivo}</p>
			<p class="motivo">{event?.historia}</p>
		</div>
	{:else}
		<div class="preview-header">
			<b class="header-title">{eventData?.motivo}</b>
			<div class="header-meta">
				<b>{eventData?.agente.nombre}</b>
			</div>
		</div>
	{/if}
</button>

<style>
	.preview-container {
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
	}
	.preview-header {
		position: relative;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: var(--b);
		width: 100%;
	}
	.header-title {
		width: 80%;
	}
	.header-meta {
		display: flex;
		font-size: smaller;
		gap: var(--a);
	}
	.header-date {
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
</style>
