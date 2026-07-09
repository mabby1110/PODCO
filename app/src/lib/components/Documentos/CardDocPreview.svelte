<script lang="ts">
	import { formatDateFull, parseDateTimeLocal } from '$lib/utils/agenda';
	import { formatCurrency } from '$lib/utils/util';
	import ListPreview from '../App/Listas/ListPreview.svelte';

	let { event } = $props();
</script>

<ListPreview href="/oportunidades/{event.id}" ocultarAcciones>
	{#snippet header()}
		<h3>{event?.titulo}</h3>
	{/snippet}
	{#snippet content()}
		{#if event?.id_agente}
			<div class="brief">
				<p>
					<b>id_agente:</b>
					{event.id_agente}
				</p>
			</div>
		{/if}
		{#if event?.id_oportunidad}
			<div class="brief">
				<a href="/oportunidades/{event.id_oportunidad}">
					<b>id_oportunidad:</b>
					{event.id_oportunidad}
				</a>
			</div>
		{/if}
		{#if event?.id_actividad}
			<div class="brief">
				<a href="/actividades/{event.id_actividad}">
					<b>id_actividad:</b>
					{event.id_actividad}
				</a>
			</div>
		{/if}
		{#if event?.preview}
			<div class="doc-preview">
				<iframe
					src={event.preview}
					class="iframe"
					title="Descripción del documento"
					loading="lazy"
					height="100%"
				></iframe>
			</div>
		{/if}
	{/snippet}
	{#snippet meta()}
		{#if event.total}
			<p>{formatCurrency(event.total, 'USD')}</p>
		{/if}
		<p>{formatDateFull(parseDateTimeLocal(event.fecha_creacion))}</p>
	{/snippet}
</ListPreview>

<style>
	.doc-preview {
		height: 40vh;
	}
	a {
		pointer-events: all;
	}
</style>
