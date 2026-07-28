<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, openByDefault = false, children }: { title: string; openByDefault?: boolean; children?: Snippet } = $props();

	let isOpen = $derived(openByDefault);
	let input = $state<HTMLElement | null>(null);
		
	function open() {
		isOpen = true;
	}

	function close() {
		isOpen = false;
	}

	$effect(() => {
		if (isOpen && input && !openByDefault) {
			input.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
		}
	});
</script>

{#if !isOpen}
	<button class="butter optional-button" type="button" onclick={open}>
		{title}
	</button>
{:else}
	<div class="optional-input" bind:this={input}>
		<button class="butter chile" type="button" onclick={close}>✕</button>
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
