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
>
	{#if $appState.calendarCards}
		<header>
			<b>{eventData?.motivo}</b>
		</header>

		<p class="motivo">{event?.objetivo}</p>

		<div class="meta">
			<span>{eventData?.agente.nombre}</span>
			<span>{eventData?.inicio}</span>
		</div>
	{:else}
		<div class="meta-min">
			{#if $profile?.isAdmin}
				<span class="meta-item">{eventData?.agente.nombre}</span>
				<span class="meta-item">{eventData?.motivo}</span>
			{:else}
				<span class="meta-item">{eventData?.motivo}</span>
				<span class="meta-item">{eventData?.objetivo}</span>
			{/if}
		</div>
	{/if}
</button>

<style>
	button {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		width: 100%;
		border: 1px solid var(--color-muted);
		border-radius: var(--a);
		padding: 4px var(--a);
		text-align: left;
		align-content: flex-start;
		gap: var(--a);
		backdrop-filter: blur(16px);
		overflow: hidden;
		z-index: 1;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		pointer-events: auto;
	}
	header {
		flex-grow: 1;
	}
	.meta {
		display: flex;
		gap: var(--a);
		font-size: 0.75rem;
		opacity: 0.8;
	}
	.meta-min {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--a);
		justify-content: space-around;
		position: absolute;
		top: 2px;
		left: 4px;
	}
	.meta-item {
		flex-grow: 1;
	}
	.motivo {
		font-size: 0.8rem;
		opacity: 0.9;
	}
</style>
