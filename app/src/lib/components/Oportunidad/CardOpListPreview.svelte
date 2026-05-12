<script lang="ts">
	import { page } from '$app/state';
	import { fases } from '$lib';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { getStyleForPhase } from '$lib/utils/util';

	let { event } = $props();
	const { clientes, agentes } = $derived(page.data);

	const eventData = $derived.by(() => {
		if (!event) return null;
		return {
			id: event.id,
			razon_social:
				clientes?.find((c: { id: any }) => c.id == event.id_cliente)?.razon_social ?? '',
			agente: agentes?.find((e: { id: any }) => e.id == event.id_agente) ?? $profile,
			fase: fases.find((f) => f.id_fase == event.fase),
			motivo: event?.motivo,
			inicio: event?.inicio.split(' ')[0],
			fin: event?.fin,
			historia: event.historia,
			requisitos: event.requisitos,
			observaciones: event.observaciones,
			cotizaciones_ganadas: event.cotizaciones_ganadas,
			cotizaciones_presentadas: event.cotizaciones_presentadas,
			oc_cliente: event.oc_cliente,
			documentos_operacion: event.documentos_operacion,
			documentos: event.documentos,
			objetivo: event.objetivo,
			style: getStyleForPhase(event.fase)
		};
	});
</script>

<a href="/oportunidades/{event.id}" class="card-list-preview" style={eventData?.style}>
	<div class="title">
		<h3>{eventData?.motivo}</h3>
		<p>{eventData?.razon_social}</p>
	</div>

	{#if eventData?.objetivo}
		<div class="brief">
			<b>Objetivo</b>
			<p>{eventData?.objetivo}</p>
		</div>
	{/if}
	<div class="meta">
		<p class="id">{eventData?.id}</p>
		<p>{eventData?.agente.nombre}</p>
		<p>{eventData?.inicio}</p>
	</div>
</a>

<style>
.brief {
    overflow: hidden;
}
</style>
