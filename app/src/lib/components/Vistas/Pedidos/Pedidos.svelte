<script lang="ts">
	import ListPreview from '$lib/components/Tarjetas/ListPreview.svelte';
	import { formatDateFull, parseDateTimeLocal } from '$lib/utils/agenda';
	import { formatCurrency } from '$lib/utils/util';
	import TarjetaPedido from '../Pedidos/TarjetaPedido.svelte';

	let { documento } = $props();
	let show = $state(false);
	console.log('pedidos: ', documento);
</script>

<div
	class="panel"
	style={documento.pedidos.some((p) => p.estatus == 'cotizado')
		? 'background-color:var(--color-3);'
		: ''}
>
	<div class="header">
		<h3>
			<b>{documento.pedidos.some((p) => p.estatus == 'cotizado') ? 'Actual' : 'Descartada'}</b>: {documento?.titulo}
			{#if documento.total}
				<p>{formatCurrency(documento.total, 'USD')}</p>
			{/if}
		</h3>
	</div>
	<div class="panel">
		{#each documento.pedidos as item}
			<TarjetaPedido {item} />
		{/each}
	</div>
	{#if show}
		<div>
			{#if documento?.id_actividad}
				<div class="brief">
					<a href="/actividades/{documento.id_actividad}">
						<b>id_actividad:</b>
						{documento.id_actividad}
					</a>
				</div>
			{/if}
			{#if documento?.id_actividad}
				<div class="brief">
					<a href="/actividades/{documento.id_actividad}">
						<b>id_actividad:</b>
						{documento.id_actividad}
					</a>
				</div>
			{/if}
			{#if documento?.preview}
				<div class="doc-preview">
					<iframe
						src={documento.preview}
						class="iframe"
						title="Descripción del documento"
						loading="lazy"
						height="100%"
						width="100%"
					></iframe>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.panel {
		padding: var(--a);
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
	.header {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
	}
	.doc-preview {
		height: 40vh;
	}
</style>
