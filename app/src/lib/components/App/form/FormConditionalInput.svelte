<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		isOpen = $bindable(),
		titleOpen,
		children
	}: { isOpen: boolean; titleOpen: string; children?: Snippet } = $props();

	let input = $state<HTMLElement | null>(null);

	function open() {
		isOpen = true;
	}

	function close() {
		isOpen = false;
	}
	
	$effect(() => {
		if (isOpen && input) {
			input.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
		}
	});
</script>

{#if isOpen}
	<div class="optional-input" bind:this={input}>
		<button class="close-btn" type="button" onclick={close}>✕</button>
		{#if children}
			{@render children()}
		{/if}
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
	.optional-input {
		display: flex;
		flex-grow: 1;
		width: 100%;
		gap: var(--a);
		align-items: flex-start;
	}
</style>
