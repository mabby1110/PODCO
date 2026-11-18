<!-- DocPreview.svelte -->
<script lang="ts">
	interface Props {
		src: string | null | undefined;
		title?: string;
		loading?: 'lazy' | 'eager';
		minHeight?: string;
	}

	let { src, title = 'Vista previa del documento', loading = 'lazy', minHeight = '24rem' }: Props = $props();

	let cargado = $state(false);
	let fallo = $state(false);

	$effect(() => {
		src;
		cargado = false;
		fallo = false;
	});
</script>

<div class="doc-preview" style:min-height={minHeight}>
	{#if !src}
		<p class="estado">Sin vista previa disponible.</p>
	{:else}
		{#if !cargado && !fallo}
			<p class="estado">Cargando documento…</p>
		{/if}

		{#if fallo}
			<p class="estado">
				No se pudo cargar la vista previa.
				<a href={src} target="_blank" rel="noopener noreferrer">Abrir en otra pestaña</a>
			</p>
		{/if}

		<iframe
			{src}
			{title}
			{loading}
			class="iframe"
			class:oculto={!cargado}
			onload={() => (cargado = true)}
			onerror={() => (fallo = true)}
		></iframe>
	{/if}
</div>

<style>
	.doc-preview {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
	}

	.iframe {
		flex: 1;
		width: 100%;
		height: 100%;
		border: 0;
		aspect-ratio: 16 / 9;
	}

	.oculto {
		visibility: hidden;
		position: absolute;
		inset: 0;
	}

	.estado {
		margin: auto;
		padding: 1rem;
		text-align: center;
		font-size: 0.875rem;
	}
</style>