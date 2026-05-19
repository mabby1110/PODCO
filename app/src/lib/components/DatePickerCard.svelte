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

	// Estado para controlar la expansión de la tarjeta
	let isExpanded = $state(false);

	const eventData = $derived.by(() => {
		if (!event) return null;

		return {
			id: event.id,
			razon_social:
				clientes?.find((c: { id: any }) => c.id == event.id_cliente)?.razon_social ?? '',
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

	// Manejador del clic en el enlace
	function handleClick(e: MouseEvent) {
		if (!isExpanded) {
			e.preventDefault(); // Previene la navegación en el primer clic
			isExpanded = true;
		}
		// Si isExpanded es true, no hacemos preventDefault y navega a la URL
	}

	// Manejador de pérdida de foco (clic fuera del elemento)
	function handleFocusOut(e: FocusEvent) {
		const currentTarget = e.currentTarget as HTMLElement;
		const relatedTarget = e.relatedTarget as Node;
		
		// Si el nuevo elemento enfocado NO es hijo de esta tarjeta, se contrae
		if (!currentTarget.contains(relatedTarget)) {
			isExpanded = false;
		}
	}
</script>

<a
	href="#"
	class="card-calendar-preview {isExpanded ? 'expanded' : ''}"
	style={eventData?.style}
	use:draggable={{ data: event.id, enabled: isDndEnabled }}
	onclick={handleClick}
	onfocusout={handleFocusOut}
>
	{#if $appState.calendarCards}
		<div class="preview-header">
			<p class="header-date">{eventData?.inicio.split(' ')[1]}</p>
			<b class="header-title">{eventData?.razon_social}</b>
			<div class="meta">
				<b>{eventData?.agente?.nombre}</b>
				<p>{event?.motivo}</p>
				<p class="motivo">{event?.objetivo}</p>
			</div>
		</div>
	{:else}
		<div class="preview-header">
			<b class="header-title">{eventData?.razon_social}</b>
			<div class="meta-min">
				<b>{eventData?.agente?.nombre}</b>
				<p>{event?.motivo}</p>
				<p class="motivo">{event?.objetivo}</p>
			</div>
		</div>
	{/if}
</a>

<style>
	/* Estilos base añadidos para asegurar que el componente no se rompa al contraerse */
	.card-calendar-preview {
		display: block;
		box-sizing: border-box;
		transition: max-width 0.2s ease, box-shadow 0.2s ease;
		text-decoration: none;
		color: inherit;
	}

	/* Estilos aplicados al hacer el primer clic */
	.card-calendar-preview.expanded {
		height: max-content !important;
		min-height: fit-content !important;
		
		/* IMPORTANTE: Usa 40vw (viewport width) si el contenedor padre es muy estrecho,
		   de lo contrario, 40% se basará en el tamaño de la columna de esa hora. */
		width: 100% !important; 
		
		z-index: 1000 !important;
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
		overflow: visible;
	}

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