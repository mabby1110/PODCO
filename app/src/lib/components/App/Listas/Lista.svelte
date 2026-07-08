<script lang="ts">
	import type { Snippet } from 'svelte';

	let { acciones, contenido }: { acciones: Snippet; contenido: Snippet } = $props();
</script>

<div class="view-container">
	<div class="view-content">
		{#if contenido}
			{@render contenido()}
		{/if}
	</div>
	<div class="view-controls">
		{#if acciones}
			{@render acciones()}
		{/if}
	</div>
</div>

<style>
	.view-container {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		position: relative;
	}
	.view-content {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
	.view-controls {
		position: absolute;
		width: 100%;
		max-width: 70vw;
		bottom: var(--a);
		z-index: 88;
		align-self: flex-end;

		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		align-items: flex-start;
		flex-direction: row-reverse;
		top: 0;
	}
</style>
