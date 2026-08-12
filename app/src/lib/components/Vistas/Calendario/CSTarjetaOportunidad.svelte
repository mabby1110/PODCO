<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { fases } from '$lib';
	import { draggable } from '$lib/actions/dnd';
	import { appState } from '$lib/stores/appState.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { getStyleForPhase } from '$lib/utils/util';

	let { event, expanded, style } = $props();
	const { clientes, agentes } = $derived(page.data);
	const isDndEnabled = $derived($appState.dnd);

	const eventData = $derived.by(() => {
		if (!event) return null;

		return {
			...event,
			id: event.id,
			razon_social:
				clientes?.find((c: { id: any }) => c.id == event.id_cliente)?.razon_social ?? '',
			nombre_comercial:
				clientes?.find((c: { id: any }) => c.id == event.id_cliente)?.nombre_comercial ?? '',
			agente: agentes?.find((e: { id: any }) => e.id == event.id_agente) ?? $profile,
			motivo: event?.motivo,
			inicio: event?.inicio,
			fase: fases.find((f) => f.id_fase == event.fase),
			historia: event.historia || 'Sin historial registrado',
			cotizaciones: event.cotizaciones || 'No hay cotizaciones',
			documentos: event.documentos || 'Sin documentos',
			style: getStyleForPhase(event.fase) + style
		};
	});
</script>

<div
	class="tarjeta-actividad"
	style={eventData?.style}
	use:draggable={{ data: event.id, enabled: isDndEnabled }}
>
	{#if expanded}
		<div class="header">
			<b class="title">{eventData?.razon_social || eventData?.nombre_comercial}</b>
			<div class="meta-min">
				<b>{eventData?.agente?.nombre}</b>
				<p>{eventData?.motivo}</p>
				<p class="motivo">{eventData?.objetivo}</p>
				<b class="motivo">{eventData?.necesidades}</b>
			</div>
		</div>
	{:else}
		<div class="header">
			<p>{event?.motivo}</p>
			<b class="title">{eventData?.razon_social || eventData?.nombre_comercial}</b>
			<div class="meta">
				<b>{eventData?.agente?.nombre}</b>
			</div>
		</div>
	{/if}
	{#if expanded}
		<button class="butter" onclick={() => goto(`/oportunidades/${event.id}`)}> Ver </button>
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
		width: 100%;
	}
	.title {
		width: 80%;
		word-break: break-all;
		min-width: 100%;
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
