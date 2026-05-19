<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, children }: { title: string; children?: Snippet } = $props();

	let isOpen = $state(false);

	function open() {
		isOpen = true;
	}

	function close() {
		isOpen = false;
	}
</script>

{#if !isOpen}
	<button class="butter" type="button" onclick={open}>
		{title}
	</button>
{:else}
	<div class="optional-input">
		<button class="close-btn" type="button" onclick={close}>✕</button>
		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}

<style>
	.optional-input {
		display: flex;
		flex-grow: 1;
		order: 1;
		width: 100%;
		gap: var(--a);
		align-items: flex-start;
	}
</style>
