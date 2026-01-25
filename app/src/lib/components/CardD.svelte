<script lang="ts">
	import { page } from '$app/state';
	import { selectedEvent } from '$lib/stores/selectedEvent';
	import { slide } from 'svelte/transition';
	import PhaseAction from './PhaseAction.svelte';
	import { invalidateAll } from '$app/navigation';
	import { getStyleForPhase } from '$lib/utils/util';
	import { fases } from '$lib';

	const { clientes, agentes } = $derived(page.data);

	// Agrupa todas las derivaciones en un solo $derived.by para mejor reactividad
	const eventData = $derived.by(() => {
		const event = $selectedEvent;
		if (!event) return null;

		return {
			id: event.id_oportunidad ?? '',
			razon_social: clientes[event.id_cliente-1]?.razon_social ?? '',
			agente: agentes.find((e) => e.id == event.id_agente) ?? '',
			fase: fases.find(f => f.id == event.fase),
			historia: event.historia || '',
			cotizaciones: event.cotizaciones || '',
			documentos: event.documentos || 'Sin documentos',
			style: getStyleForPhase(event.fase)
		};
	});

	function closeCard(e: MouseEvent) {
		e.stopPropagation();
		selectedEvent.clear();
	}

	function handleActionSuccess() {
		console.log('Acción completada con éxito');
		selectedEvent.clear();
		invalidateAll();
		window.location.reload();
	}
</script>

{#if $selectedEvent && eventData}
	<div class="card-d" transition:slide>
		<header style={eventData.style}>
			<button class="close-btn" onclick={closeCard} aria-label="Cerrar">✕</button>
			<h1>{$selectedEvent.motivo}</h1>
			<h3>{eventData.razon_social}</h3>
			<div class="meta">
				<p>{eventData.agente.nombre}</p>
				<p>-</p>
				<p>Fase: <strong>{eventData.fase.actual}</strong></p>
			</div>
		</header>

		<section class="grid">
			<p class="date">{$selectedEvent.inicio}</p>
			<PhaseAction {...eventData} onSuccess={handleActionSuccess} />
		</section>
	</div>
{/if}

<style>
	.card-d {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		border-radius: 12px;
		border: 1px solid var(--color-secondary);
		width: 100%;
		overflow: hidden;
	}
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
	.grid {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--b);
		overflow: auto;
	}
	.grid .date {
		position: absolute;
		right: var(--a);
		top: 0;
		font-size: 0.85em;
	}
	.meta {
		display: flex;
		gap: var(--a);
	}
</style>
