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
	{#if children}
		{@render children()}
	{/if}
	<button class="close-btn" type="button" onclick={close}>✕</button>
{:else}
	<button class="butter" type="button" onclick={open}>
		{titleOpen}
	</button>
{/if}

<style>
	.butter {
		width: fit-content;
	}
</style>
