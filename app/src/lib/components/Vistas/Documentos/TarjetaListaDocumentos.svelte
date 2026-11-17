<script lang="ts">
	import TarjetaPrevista from '$lib/components/Tarjetas/TarjetaPrevista.svelte';

	let { documento } = $props();
	console.log(documento);
</script>

<TarjetaPrevista>
	{#snippet titulo()}
		<b>
			{documento?.titulo}
		</b>
	{/snippet}
	{#snippet contenido()}
		{#if documento?.id_actividad}
			<div class="brief">
				<a href="/actividades/{documento.id_actividad}">
					<b>id_actividad:</b>
					{documento.id_actividad}
				</a>
			</div>
		{/if}
		{#if documento?.id_oportunidad}
			<div class="brief">
				<a href="/actividades/{documento.id_oportunidad}">
					<b>id_oportunidad:</b>
					{documento.id_oportunidad}
				</a>
			</div>
		{/if}

		{#if documento?.id_agente}
			<div class="brief">
				<a href="/actividades/{documento.id_agente}">
					<b>id_agente:</b>
					{documento.id_agente}
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
	{/snippet}
</TarjetaPrevista>

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
		pointer-documentos: all;
	}
</style>
