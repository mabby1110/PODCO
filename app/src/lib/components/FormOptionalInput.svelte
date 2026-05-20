<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, children }: { title: string; children?: Snippet } = $props();

	let isOpen = $state(false);
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

{#if !isOpen}
	<button class="butter" type="button" onclick={open}>
		{title}
	</button>
{:else}
	<div class="optional-input" bind:this={input}>
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
		width: 100%;
		gap: var(--a);
		align-items: flex-start;
	}
</style>
