<script lang="ts">
	import { formatCurrency } from '$lib/utils/util';
	import SubirOcc from '../Documentos/SubirOcc.svelte';
	import TarjetaPedido from '../Pedidos/TarjetaPedido.svelte';

	let { documento, pedidos, oportunidad, editando = false } = $props();
	let show = $state(false);
	console.log('pedidos: ', documento);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="panel"
	style={documento.pedidos.some((p) => p.estatus == 4) ? 'background-color:var(--color-4);' : ''}
>
	<div class="header" onclick={() => (show = !show)}>
		<h3>
			<b>Ganada</b>: {documento?.titulo}
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
		cursor: pointer;
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
