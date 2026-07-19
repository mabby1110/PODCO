<script lang="ts">
	import { page } from '$app/state';
	import { fases } from '$lib';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { formatDateFull, parseDateTimeLocal } from '$lib/utils/agenda';
	import { getStyleForPhase } from '$lib/utils/util';
	import ListPreview from '../App/Listas/ListPreview.svelte';

	let { event } = $props();
	const { clientes, agentes } = $derived(page.data);

	const eventData = $derived.by(() => {
		if (!event) return null;
		return {
			id: event.id,
			nombre_comercial:
				clientes?.find((c: { id: any }) => c.id == event.id_cliente)?.nombre_comercial ?? '',
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

<ListPreview href="/oportunidades/{event.id}" style={eventData?.style}>
	{#snippet header()}
		<h3>{eventData?.razon_social || eventData?.nombre_comercial}</h3>
		<p>{eventData?.motivo}</p>
	{/snippet}

	{#snippet content()}
		{#if eventData?.objetivo}
			<div class="brief">
				<b>Objetivo</b>
				<p>{eventData?.objetivo}</p>
			</div>
		{/if}

		{#if eventData?.historia}
			<div class="brief">
				<b>Historia</b>
				<div class="entradas">
					{#each JSON.parse(eventData?.historia) as item}
						<div class="entrada">
							<p>{formatDateFull(parseDateTimeLocal(item.fecha))}:</p>
							{#if item.nombre_perfil}
								<p class="profile">{item.nombre_perfil},</p>
							{/if}
							<p>{item.entrada}</p>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{/snippet}
	{#snippet meta()}
		<p>{eventData?.agente?.nombre}</p>
		<p>{eventData?.inicio}</p>
	{/snippet}
</ListPreview>
