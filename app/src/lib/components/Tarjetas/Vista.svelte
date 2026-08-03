<script lang="ts">
	import type { Snippet } from 'svelte';

	let { acciones, contenido }: { acciones: Snippet; contenido: Snippet } = $props();
</script>

<div class="vista">
	{#if contenido}
		{@render contenido()}
	{/if}
</div>
<div class="controles">
	{#if acciones}
		{@render acciones()}
	{/if}
</div>

<style>
	.vista {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: auto;
		display: flex;
		flex-direction: column;
		gap: var(--b);
		padding: var(--a);
		padding-bottom: var(--f);
	}
	.controles {
		position: fixed;
		max-width: 70vw;
		bottom: 0;
		right: 0;
		z-index: 88;
		padding: var(--a);

		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		flex-wrap: wrap-reverse;
		justify-content: flex-end;
	}
</style>
