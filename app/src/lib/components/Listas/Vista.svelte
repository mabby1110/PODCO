<script lang="ts">
	import type { Snippet } from 'svelte';

	let { acciones, contenido }: { acciones: Snippet; contenido: Snippet } = $props();
</script>

<div class="view-container">
	{#if contenido}
		{@render contenido()}
	{/if}
</div>
<div class="view-controls">
	{#if acciones}
		{@render acciones()}
	{/if}
</div>

<style>
	.view-container {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		position: relative;
		overflow: auto;
		margin: auto;
		padding-bottom: 12vh;
	}
	.view-controls {
		position: fixed;
		max-width: 70vw;
		bottom: 0;
		right: 0;
		z-index: 88;
		padding: var(--a);

		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		flex-direction: row-reverse;
		flex-wrap: wrap-reverse;
	}
</style>
