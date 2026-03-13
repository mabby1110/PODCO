<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		isOpen = $bindable(),
		titleOpen,
		titleClose,
		children
	}: { isOpen: boolean; titleOpen: string; titleClose: string; children?: Snippet } = $props();

	function open() {
		isOpen = true;
	}

	function close() {
		isOpen = false;
	}
</script>

{#if isOpen}
	<button class="close-btn" type="button" onclick={close}>✕</button>
{:else}
	<button class="butter" type="button" onclick={open}>
		{titleOpen}
	</button>
{/if}

<style>
	.optional-input {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		width: 100%;
		gap: var(--a);
	}
</style>
