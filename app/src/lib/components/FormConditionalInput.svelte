<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		isOpen = $bindable(),
		titleOpen,
		children
	}: { isOpen: boolean; titleOpen: string; children?: Snippet } = $props();

	function open() {
		isOpen = true;
	}

	function close() {
		isOpen = false;
	}
</script>

{#if isOpen}
	<div class="open">
		{#if children}
			{@render children()}
		{/if}
		<button class="close-btn" type="button" onclick={close}>✕</button>
	</div>
{:else}
	<button class="butter" type="button" onclick={open}>
		{titleOpen}
	</button>
{/if}

<style>
	.butter {
		width: fit-content;
	}
	.open {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: var(--b);
	}
</style>
