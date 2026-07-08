<script lang="ts">
	import type { Snippet } from 'svelte';

	let { acciones, contenido }: { acciones: Snippet; contenido: Snippet } = $props();
</script>

<div class="view-container">
	<div class="controls">
		{#if acciones}
			{@render acciones()}
		{/if}
	</div>

	<div class="view-content">
		{#if contenido}
			{@render contenido()}
		{/if}
	</div>
</div>

<style>
	.view-container {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding-bottom: var(--f);
	}
	.view-content {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
</style>
