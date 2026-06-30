<script lang="ts">
	import { page } from '$app/state';
	import { formatCurrency, getStyleForPhase } from '$lib/utils/util';
	import { fases } from '$lib';
	import { profile } from '$lib/stores/profileStore.svelte';
	import AgentActions from '$lib/components/Oportunidad/AgentActions.svelte';
	import OperActions from '$lib/components/Oportunidad/OperActions.svelte';
	import Card from '$lib/components/Card.svelte';
	import FormEditableContact from '$lib/components/Cliente/FormEditableContact.svelte';
	import Entradas from '$lib/components/Entradas.svelte';
	import EditableInput from '$lib/components/App/form/EditableInput.svelte';
	import CardDocPreview from '$lib/components/Documentos/CardDocPreview.svelte';
	import SubirAdjunto from '$lib/components/Documentos/SubirAdjunto.svelte';
	import SubirCotizacion from '$lib/components/Documentos/SubirCotizacion.svelte';
	import SubirOcc from '$lib/components/Documentos/SubirOcc.svelte';

	let { data } = $props();

	const clientes = $derived(page.data.clientes || []);
	const agentes = $derived(page.data.agentes || []);
	const event = $derived(data.oportunidad);
	const eventData = $derived.by(() => {
		if (!event) return null;
		return {
			id: event.id,
			cotizaciones: event.docs_cotizaciones,
			adjuntos: event.docs_adjuntos,
			occ: event.docs_occ,
			ocp: event.docs_ocp,
			cliente: clientes?.find((c: { id: any }) => c.id == event.id_cliente),
			agente: agentes?.find((e: { id: any }) => e.id == event.id_agente) ?? $profile,
			fase: fases.find((f) => f.id_fase == event.fase),
			motivo: event?.motivo,
			inicio: event?.inicio,
			fin: event?.fin,
			historia: event.historia,
			necesidades: event.necesidades,
			potencial_venta: event.potencial_venta,
			requisitos: event.requisitos,
			observaciones: event.observaciones,
			cotizaciones_ganadas: event.cotizaciones_ganadas,
			cotizaciones_presentadas: event.cotizaciones_presentadas,
			oc_cliente: event.oc_cliente,
			objetivo: event.objetivo,
			monto_oc: formatCurrency(event.monto_oc, 'USD'),
			etiquetas: event.etiquetas,
			style: getStyleForPhase(event.fase)
		};
	});
	let currentFase = $derived(eventData?.fase?.id_fase || 1);
	let isEditing = $state(false);
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
				<a href="/clientes/{eventData.cliente.id}"
					><h3>{eventData.cliente.razon_social || eventData.cliente.nombre_comercial}</h3></a
				>
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

			<EditableInput
				{isEditing}
				id={eventData.id}
				label="Objetivo"
				name="objetivo"
				type="textarea"
				value={eventData.objetivo}
				action="/oportunidades?/update"
				placeholder="Objetivo"
			>
				{#snippet header()}
					<input type="hidden" name="id" value={eventData.id} />
				{/snippet}
			</EditableInput>

			<EditableInput
				{isEditing}
				id={eventData.id}
				label="Potencial de venta"
				name="potencial_venta"
				type="text"
				value={eventData.potencial_venta}
				action="/oportunidades?/update"
				placeholder="Potencial de venta"
			/>

			<EditableInput
				{isEditing}
				id={eventData.id}
				label="Necesidades"
				name="necesidades"
				type="text"
				value={eventData.necesidades}
				action="/oportunidades?/update"
				placeholder="Necesidades"
			/>

			<EditableInput
				{isEditing}
				id={eventData.id}
				label="Requisitos"
				name="requisitos"
				type="text"
				value={eventData.requisitos}
				action="/oportunidades?/update"
				placeholder="Requisitos"
			/>

			<EditableInput
				{isEditing}
				id={eventData.id}
				label="Observaciones"
				name="observaciones"
				type="text"
				value={eventData.observaciones}
				action="/oportunidades?/update"
				placeholder="Observaciones"
			/>

			<FormEditableContact
				lista={eventData.cliente.contactos}
				id={eventData.cliente.id}
				id_agente={$profile?.isAdmin ? eventData.cliente.id_agente : $profile?.id}
				action="/clientes?/update"
				{isEditing}
			/>

			{#if currentFase >= 2}
				<section class="cotizacion">
					<div class="block-header">
						<h2>Cotizaciones</h2>
					</div>
					{#if eventData.cotizaciones.length > 0}
						<div class="block-content">
							{#each eventData.cotizaciones as documento}
								<CardDocPreview event={documento} />
							{/each}
						</div>
					{/if}
					{#if currentFase >= 2 && currentFase <= 3 && (eventData.cotizaciones.length <= 0 || isEditing)}
						<SubirCotizacion
							name={'docs_cotizaciones'}
							amountLabel="Total cotizado"
							amountName="totales"
							id_nodo_p={eventData.id}
							cliente={eventData.cliente}
							agente={eventData.agente}
							action="/documentos?/add"
							required
							multiple
						/>
					{/if}
				</section>
			{/if}
			{#if currentFase >= 3}
				<section class="occ">
					<div class="block-header">
						<h2>Orden de compra</h2>
					</div>
					{#if eventData.occ.length > 0}
						<div class="block-content">
							{#each eventData.occ as documento}
								<CardDocPreview event={documento} />
							{/each}
						</div>
					{/if}
					{#if (!$profile?.isOper || $profile?.isAdmin) && currentFase == 3 && (eventData.occ.length <= 0 || isEditing)}
						<SubirOcc
							name="docs_occ"
							amountLabel="Total"
							amountName="totales"
							id_nodo_p={eventData.id}
							cliente={eventData.cliente}
							agente={eventData.agente}
							action="/documentos?/add"
							required
							multiple
						/>
					{/if}
				</section>
			{/if}

			{#if isEditing}
				<section class="adjunto">
					<div class="block-header">
						<h2>Adjuntos</h2>
					</div>
					<SubirAdjunto
						label="Adjuntos"
						name="docs_adjuntos"
						amountName="totales"
						id_nodo_p={eventData.id}
						cliente={eventData.cliente}
						agente={eventData.agente}
						action="/documentos?/add"
						required
						multiple
					/>
					<div class="block-content">
						{#each eventData.adjuntos as documento}
							<CardDocPreview event={documento} />
						{/each}
					</div>
				</section>
			{:else if eventData.adjuntos.length > 0}
				<section>
					<div class="block-header">
						<h2>Adjuntos</h2>
					</div>
					<div class="block-content">
						{#each eventData.adjuntos as documento}
							<CardDocPreview event={documento} />
						{/each}
					</div>
				</section>
			{/if}

			<section>
				<div class="block-header">
					<h2>Historia</h2>
				</div>
				<div class="block-content">
					<Entradas
						{isEditing}
						historia={eventData.historia}
						objId={eventData.id}
						action={'/oportunidades?/update'}
					/>
				</div>
			</section>
		{/snippet}
		{#snippet actions()}
			{#if $profile?.isAdmin}
				{#if currentFase < 4}
					<AgentActions {eventData} bind:isEditing />
				{:else}
					<OperActions {eventData} />
				{/if}
			{:else if $profile?.isOper}
				<OperActions {eventData} />
			{:else}
				<AgentActions {eventData} bind:isEditing />
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
