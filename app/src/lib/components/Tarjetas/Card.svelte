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

<div class="tarjeta honey" transition:slide>
	<div class="header" style={headerStyle}>
		{#if header}
			{@render header()}
		{/if}
	</div>

	<div class="card-content">
		{#if content}
			{@render content()}
		{/if}
	</div>
</div>

<style>
	.tarjeta {
		margin: var(--a);
		padding: 0;
		position: relative;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		max-height: 100%;
	}
	.header {
		padding: var(--a);
	}
	.card-content {
		max-width: 1200px;
		padding: var(--a);
		width: 100%;
		margin: auto;
		display: flex;
		flex-direction: column;
		overflow: auto;
		gap: var(--c) var(--a);
		height: 100%;
	}
</style>
