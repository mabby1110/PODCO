<script lang="ts">
	import type { Snippet } from 'svelte';

	let { header, acciones, contenido }: { header?: string; acciones: Snippet; contenido: Snippet } =
		$props();
</script>

<div class="view-container">
	{#if header}
		<div class="header">
			<h1>{header}</h1>
		</div>
	{/if}
	<div class="view-content">
		{#if contenido}
			{@render contenido()}
		{/if}
	</div>
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
		max-width: 1200px;
		margin: auto;
	}
	.view-content {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding-bottom: 11vh;
	}
	.view-controls {
		position: absolute;
		width: 100%;
		max-width: 70vw;
		bottom: var(--a);
		right: var(--a);
		z-index: 88;
		align-self: flex-end;

		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		align-items: flex-start;
		flex-direction: row-reverse;
	}
</style>
