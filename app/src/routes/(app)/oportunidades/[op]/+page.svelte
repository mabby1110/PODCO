<script lang="ts">
	import { page } from '$app/state';
	import { formatCurrency, getStyleForPhase } from '$lib/utils/util';
	import { fases } from '$lib';
	import { profile } from '$lib/stores/profileStore.svelte';
	import FilePreview from '$lib/components/FilePreview.svelte';
	import AgentActions from '$lib/components/Oportunidad/AgentActions.svelte';
	import OperActions from '$lib/components/Oportunidad/OperActions.svelte';
	import Card from '$lib/components/Card.svelte';
	import { formatDateFull, parseDateTimeLocal } from '$lib/utils/agenda.js';
	import FormEditableContact from '$lib/components/Cliente/FormEditableContact.svelte';

	let { data } = $props();

	// 1. Extraemos los datos del padre y del hijo
	const clientes = $derived(page.data.clientes || []);
	const agentes = $derived(page.data.agentes || []);

	// 2. Determinamos la oportunidad activa (Store vs URL)
	const event = $derived(data.oportunidad);
	// 3. Formateamos los datos para la vista (tu eventData original adaptado)

	const eventData = $derived.by(() => {
		if (!event) return null;
		return {
			id: event.id,
			cliente: clientes?.find((c: { id: any }) => c.id == event.id_cliente),
			agente: agentes?.find((e: { id: any }) => e.id == event.id_agente) ?? $profile,
			fase: fases.find((f) => f.id_fase == event.fase),
			motivo: event?.motivo,
			inicio: event?.inicio,
			fin: event?.fin,
			historia: event.historia,
			necesidades: event.necesidades,
			requisitos: event.requisitos,
			observaciones: event.observaciones,
			cotizaciones_ganadas: event.cotizaciones_ganadas,
			cotizaciones_presentadas: event.cotizaciones_presentadas,
			oc_cliente: event.oc_cliente,
			documentos_operacion: event.documentos_operacion,
			documentos: event.documentos,
			objetivo: event.objetivo,
			monto_oc: formatCurrency(event.monto_oc, 'USD'),
			style: getStyleForPhase(event.fase)
		};
	});
	let currentFase = $derived(eventData?.fase?.id_fase || 1);
</script>

{#if eventData}
	<Card headerStyle={eventData.style}>
		{#snippet header()}
			<button
				onclick={() => history.back()}
				class="close {currentFase == 6 ? 'w' : ''}"
				aria-label="Cerrar"
			>
				✕
			</button>
			<div class="title">
				<h1>{eventData.motivo}</h1>
				<h3>{eventData.cliente.razon_social}</h3>
			</div>
			<div class="meta">
				<p class="date">{eventData.inicio}</p>
				<p class="date">|</p>
				<p>{eventData?.agente?.nombre}</p>
			</div>
		{/snippet}
		{#snippet content()}
			<section>
				<p>Fase: <strong>{eventData.fase?.actual}</strong></p>
			</section>

			<section>
				<FormEditableContact
					jsonList={eventData.cliente.contactos}
					id={eventData.cliente.id}
					action="/clientes?/updateClient"
				/>
			</section>

			{#if eventData.monto_oc}
				<section>
					<h3>Monto</h3>
					<h3>{eventData.monto_oc}</h3>
				</section>
			{/if}

			{#if eventData.necesidades}
				<section>
					<h3>Necesidades</h3>
					<p>{eventData.necesidades}</p>
				</section>
			{/if}

			{#if eventData.objetivo}
				<section>
					<h3>Objetivo</h3>
					<p>{eventData.objetivo}</p>
				</section>
			{/if}

			{#if eventData.requisitos}
				<section>
					<h3>Requisitos</h3>
					<p>{eventData.requisitos}</p>
				</section>
			{/if}

			{#if eventData.observaciones}
				<section>
					<h3>Observaciones</h3>
					<p>{eventData.observaciones}</p>
				</section>
			{/if}

			{#if eventData.historia}
				<section>
					<h3>Historia</h3>
					<div class="entradas">
						{#each JSON.parse(eventData?.historia) as item}
							<div class="entrada">
								<b>{formatDateFull(parseDateTimeLocal(item.fecha))}:</b>
								<p>{item.entrada}</p>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<FilePreview title="Cotizaciones Ganadas" data={eventData.cotizaciones_ganadas} />
			<FilePreview title="Cotizaciones Presentadas" data={eventData.cotizaciones_presentadas} />
			<FilePreview title="Orden de compra" data={eventData.oc_cliente} />
			<FilePreview title="Documentos de operacion" data={eventData.documentos_operacion} />
			<FilePreview title="Adjuntos" data={eventData.documentos} />
		{/snippet}
		{#snippet actions()}
			{#if $profile?.isAdmin}
				{#if currentFase < 4}
					<AgentActions {eventData} />
				{:else}
					<OperActions {eventData} />
				{/if}
			{:else if $profile?.isOper}
				<OperActions {eventData} />
			{:else}
				<AgentActions {eventData} />
			{/if}
		{/snippet}
	</Card>
{/if}

<style>
	.meta {
		display: flex;
		gap: var(--a);
	}
	.w {
		color: white;
	}
</style>
