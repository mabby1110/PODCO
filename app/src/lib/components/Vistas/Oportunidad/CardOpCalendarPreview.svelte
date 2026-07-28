<script lang="ts">
	import { page } from '$app/state';
	import { fases } from '$lib';
	import { draggable } from '$lib/actions/dnd';
	import { appState } from '$lib/stores/appState.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { getStyleForPhase } from '$lib/utils/util';

	let { event, style } = $props();
	const { clientes, agentes } = $derived(page.data);
	const isDndEnabled = $derived($appState.dnd);

	const eventData = $derived.by(() => {
		if (!event) return null;

		return {
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

<a
	href="/oportunidades/{event.id}"
	class="card-calendar-preview"
	style={eventData?.style}
	use:draggable={{ data: event.id, enabled: isDndEnabled }}
	use:draggable={event.id}
>
	{#if $appState.calendarCards}
		<div class="preview-header">
			<p class="header-date">{eventData?.inicio.split(' ')[1]}</p>
			<b class="header-title">{eventData?.razon_social || eventData?.nombre_comercial}</b>
			<div class="meta">
				<b>{eventData?.agente?.nombre}</b>
				<p>{event?.motivo}</p>
				<p class="motivo">{event?.objetivo}</p>
			</div>
		</div>
	{:else}
		<div class="preview-header">
			<b class="header-title">{eventData?.razon_social || eventData?.nombre_comercial}</b>
			<div class="meta-min">
				<b>{eventData?.agente?.nombre}</b>
				<p>{event?.motivo}</p>
				<p class="motivo">{event?.objetivo}</p>
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
	.meta-min {
		display: flex;
		flex-direction: column;
		font-size: smaller;
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
