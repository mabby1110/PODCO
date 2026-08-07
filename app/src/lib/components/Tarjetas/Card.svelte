<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';

	let {
		header,
		content,
		actions,
		headerStyle
	}: {
		header?: Snippet;
		content?: Snippet;
		actions?: Snippet;
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
		{#if actions}
			<section class="card-actions">
				{@render actions()}
			</section>
		{/if}
		{#if content}
			<div class="card-content">
				{@render content()}
			</div>
		{/if}
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
