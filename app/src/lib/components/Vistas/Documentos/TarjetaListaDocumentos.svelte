<script lang="ts">
	import ListPreview from '$lib/components/Tarjetas/ListPreview.svelte';
	import { formatDateFull, parseDateTimeLocal } from '$lib/utils/agenda';
	import { formatCurrency } from '$lib/utils/util';
	import TarjetaPedido from '../Pedidos/TarjetaPedido.svelte';

	let { event } = $props();
	console.log(event);
</script>

<ListPreview
	href="/oportunidades/{event.id}"
	ocultarAcciones
	// style={event.pedidos.some((p) => p.estatus == 3)
	// 	? 'background-color:var(--color-3);'
	// 	: ''}
>
	{#snippet header()}
		<div class="panel">
			{#each event.pedidos as item}
				<TarjetaPedido {item} />
			{/each}
		</div>
		<div class="header">
			<h3>
				<b>{event.pedidos.some((p) => p.estatus == 3) ? 'Actual' : 'Descartada'}</b>: {event?.titulo}
				{#if event.total}
					<p>{formatCurrency(event.total, 'USD')}</p>
				{/if}
			</h3>
		</div>
	{/snippet}
	{#snippet content()}
		{#if event?.id_actividad}
			<div class="brief">
				<a href="/actividades/{event.id_actividad}">
					<b>id_actividad:</b>
					{event.id_actividad}
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
					width="100%"
				></iframe>
			</div>
		{/if}
	{/snippet}
</ListPreview>

<style>
	.panel {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--b);
	}
	.header {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
	}
	.doc-preview {
		height: 40vh;
	}
	a {
		pointer-events: all;
	}
</style>
