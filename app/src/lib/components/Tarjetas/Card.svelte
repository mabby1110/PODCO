<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';

	let {
		header,
		contenido,
		acciones,
		headerStyle
	}: {
		header?: Snippet;
		contenido?: Snippet;
		acciones?: Snippet;
		headerStyle?: string;
	} = $props();
</script>

<div class="tarjeta">
	<div class="header honey" style={headerStyle}>
		{#if header}
			{@render header()}
		{/if}
	</div>

	<div class="contenido milk">
		{#if contenido}
			{@render contenido()}
		{/if}
	</div>
	<div class="acciones">
		{#if acciones}
			{@render acciones()}
		{/if}
	</div>
</div>

<style>
	.tarjeta {
		position: relative;
		display: flex;
		gap: var(--c);
		flex-direction: column;
		overflow: auto;
		padding: var(--a) var(--a) var(--f);
	}
	.header {
		max-width: 1200px;
		width: 100%;
		padding: var(--a);
		position: sticky;
		top: 0;
		z-index: 1;
		margin: 0 auto;
		display: flex;
		flex-direction: column-reverse;
	}
	.contenido {
		max-width: 1200px;
		padding: var(--a);
		width: 100%;
		margin: auto;
		display: flex;
		flex-direction: column;
		gap: var(--c) var(--a);
	}
	.acciones {
		max-width: 1200px;
		width: 100%;
		margin: auto;
	}
</style>
