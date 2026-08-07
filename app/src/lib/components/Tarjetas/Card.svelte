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

	<div class="card-content">
		{#if content}
			{@render content()}
		{/if}

		{#if actions}
			<section class="card-actions">
				{@render actions()}
			</section>
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
	.card .card-content {
		align-self: center;
		width: 100%;
		max-width: 1200px;
		overflow: auto;
		display: flex;
		flex-direction: column;
		gap: var(--c) var(--a);
		height: 100%;
		padding:var(--a) var(--a) var(--e);
	}
</style>
