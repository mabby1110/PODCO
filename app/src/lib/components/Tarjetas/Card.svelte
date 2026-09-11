<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';

	let {
		header,
		content,
		headerStyle
	}: {
		header?: Snippet;
		content?: Snippet;
		headerStyle?: string;
	} = $props();
</script>

<div class="card" transition:slide>
	{#if header}
		<div style={headerStyle}>
			{@render header()}
		</div>
	{/if}

	<div class="snippets">
		<div class="card-content">
			{#if content}
				{@render content()}
			{/if}
		</div>
	</div>
</div>

<style>
	.card {
		position: relative;
		width: 100%;
		max-height: 100dvh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
	.card .snippets {
		flex-grow: 1;
		overflow: auto;
		padding: var(--a) var(--a) var(--f);
	}
	.card-content {
		max-width: 1200px;
		width: 100%;
		margin: auto;
		display: flex;
		flex-direction: column;
		gap: var(--c) var(--a);
	}
</style>
