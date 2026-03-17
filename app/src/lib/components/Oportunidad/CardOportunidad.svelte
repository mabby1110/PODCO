<script lang="ts">
	import { page } from '$app/state';
	import { selectedOp } from '$lib/stores/selectedOp';
	import { slide } from 'svelte/transition';
	import { getStyleForPhase } from '$lib/utils/util';
	import { fases } from '$lib';
	import { profile } from '$lib/stores/profileStore.svelte';
	import PhaseAction from './PhaseAction.svelte';
	import AdjuntosGrid from '$lib/components/AdjuntosGrid.svelte';

	const { clientes, agentes } = $derived(page.data);

	let event = $derived($selectedOp);
	console.log(event);
	// Agrupa todas las derivaciones en un solo $derived.by para mejor reactividad
	const eventData = $derived.by(() => {
		if (!event) return null;

		return {
			id: event.id,
			razon_social:
				clientes?.find((c: { id: any }) => c.id == event.id_cliente)?.razon_social ?? '',
			agente: agentes?.find((e: { id: any }) => e.id == event.id_agente) ?? $profile,
			fase: fases.find((f) => f.id_fase == event.fase),
			motivo: event?.motivo,
			inicio: event?.inicio,
			fin: event?.fin,
			historia: event.historia,
			requisitos: event.requisitos,
			cotizaciones: event.cotizaciones,
			documentos: event.documentos,
			adjuntos: event.adjuntos,
			objetivo: event.objetivo,
			style: getStyleForPhase(event.fase)
		};
	});

	function closeCard(e: MouseEvent) {
		e.stopPropagation();
		selectedOp.clear();
	}
</script>

{#if $selectedOp && eventData}
	<div class="card-full" transition:slide>
		<header style={eventData.style}>
			<button class="close-btn" onclick={closeCard} aria-label="Cerrar">✕</button>
			<h1>{eventData.motivo}</h1>
			<h3>{eventData.razon_social}</h3>
			<div class="meta">
				<p class="date">{eventData.inicio}</p>
				<p>{eventData.agente.nombre}</p>
				<p>-</p>
				<p>Fase: <strong>{eventData?.fase?.actual}</strong></p>
			</div>
		</header>
		<div class="card-content">
			<!-- informacion -->
			{#if eventData.objetivo}
				<section class="historia">
					<h3>Objetivo</h3>
					<p>{eventData.objetivo}</p>
				</section>
			{/if}
			{#if eventData.historia}
				<section class="historia">
					<h3>Historia</h3>
					<p>{eventData.historia}</p>
				</section>
			{/if}
			{#if eventData.requisitos}
				<section class="requisitos">
					<h3>Requisitos</h3>
					<p>{eventData.requisitos}</p>
				</section>
			{/if}

			{#if eventData.cotizaciones}
				<section class="cotizaciones">
					<h3>Cotizaciones</h3>
					<div class="documentos">
						{#each JSON.parse(eventData.cotizaciones) as cotizacion}
							<iframe src={cotizacion.preview} class="iframe" title="Descripción"></iframe>
							<!-- <a href={cotizacion.url}>{cotizacion.id}</a> -->
						{/each}
					</div>
				</section>
			{/if}
			{#if eventData.adjuntos}
				<section>
					<h3>Documentos</h3>
					<AdjuntosGrid adjuntos={eventData.adjuntos} />
				</section>
			{/if}

			<section class="card-actions">
				<PhaseAction {...eventData} />
			</section>
		</div>
	</div>
{/if}

<style>
	header {
		display: flex;
		gap: var(--a);
		position: relative;
		flex-direction: column;
		justify-content: space-between;
		align-items: flex-start;
		background-color: var(--color-primary);
		backdrop-filter: blur(16px);
		padding: var(--a);

		position: sticky;
		top: 0;
		z-index: 99;
	}
	header h3 {
		margin-bottom: var(--b);
	}
	header h1 {
		width: 100%;
	}
	header .date {
		position: fixed;
		bottom: 4px;
		right: 4px;
	}
	.close-btn {
		position: absolute;
		right: var(--a);
		background: transparent;
		border: none;
		line-height: 1;
		padding: 0;
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.2s;
		flex-shrink: 0;
	}
	.meta {
		display: flex;
		gap: var(--a);
	}
	.iframe {
		width: fit-content;
		max-width: 80vw;
		height: 40vh;
		pointer-events: none;
	}
	.documentos {
		width: 80vw;
		height: fit-content;
		display: flex;
		overflow: auto;
		-webkit-overflow-scrolling: touch;
	}
</style>
