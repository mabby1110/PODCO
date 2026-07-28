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
		<header style={headerStyle}>
			{@render header()}
		</header>
	{/if}

	<div class="card-content">
		{#if content}
			{@render content()}
		{/if}

		{#if actions}
			<div class="card-actions">
				{@render actions()}
			</div>
		{/if}
	</div>
</div>

<style>
	.card {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: fit-content;
		max-height: 100dvh;
		overflow: hidden;
		position: relative;
		height: 100%;
		position: relative;
	}
	.card .card-content {
		align-self: center;
		width: 100%;
		max-width: 1200px;
		overflow: auto;
		display: flex;
		flex-direction: column;
		gap: var(--a);
		height: 100%;
		padding:var(--a) var(--a) var(--e);
	}

	.card-actions {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--b);
		border-top: 1px solid var(--color-secondary);
	}
</style>
