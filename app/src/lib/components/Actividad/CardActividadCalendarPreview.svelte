<script lang="ts">
	import { page } from '$app/state';
	import { fases } from '$lib';
	import { draggable } from '$lib/actions/dnd';
	import { appState } from '$lib/stores/appState.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
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
</script>

<a
	href="/actividades/{event.id}"
	class="card-calendar-preview"
	style={eventData?.style}
	use:draggable={{ data: event.id, enabled: isDndEnabled }}
	use:draggable={event.id}
>
	{#if $appState.calendarCards}
		<div class="preview-header">
			<p class="header-date">{eventData?.inicio.split(' ')[1]}</p>
			<b class="header-title">{eventData?.motivo}</b>
			<div class="header-meta">
				<b>{eventData?.agente?.nombre}</b>
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
				<b>{eventData?.agente?.nombre}</b>
			</div>
		</div>
	{/if}
</a>

<style>
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
