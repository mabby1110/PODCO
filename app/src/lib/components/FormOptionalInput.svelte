<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';

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
		{#if children}
			{@render children()}
		{/if}
		<button class="close-btn" type="button" onclick={close}>✕</button>
	</div>
{/if}

<style>
	.optional-input {
		display: flex;
		flex-grow: 1;
		gap: var(--a);
	}
</style>
