<script lang="ts">
	import { page } from '$app/state';
	import { fases } from '$lib';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { formatDateFull, parseDateTimeLocal } from '$lib/utils/agenda';
	import { getStyleForPhase } from '$lib/utils/util';
	import ListPreview from '../ListPreview.svelte';

	let { event } = $props();
	const { clientes, agentes } = $derived(page.data);

	const eventData = $derived.by(() => {
		if (!event) return null;
		return {
			id: event.id,
			fecha_creacion: event.fecha_creacion,
			titulo: event.titulo,
			url: event.url,
			preview: event.preview,
			id_agente: event.id_agente,
			id_oportunidad: event.id_oportunidad,
			id_actividad: event.id_actividad,
			tipo: event.tipo
		};
	});
</script>

<ListPreview href="/oportunidades/{event.id}">
	{#snippet header()}
		<h2>{eventData?.titulo}</h2>
	{/snippet}

	{#snippet content()}
		{#if eventData?.preview}
			<div class="brief">
				<iframe
					src={eventData.preview}
					class="iframe"
					title="Descripción del documento"
					loading="lazy"
					height="100%"
				></iframe>
			</div>
		{/if}
	{/snippet}

	<!-- {#snippet meta()}
		<p class="id">{eventData?.id}</p>
		<p>{eventData?.agente?.nombre}</p>
		<p>{eventData?.inicio}</p>
	{/snippet} -->
</ListPreview>

<style>
	.brief {
		height: 80vh;
	}
</style>
