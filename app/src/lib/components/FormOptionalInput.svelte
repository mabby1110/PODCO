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

	.close-btn {
		border: none;
		cursor: pointer;
		width: var(--d);
		height: var(--d);
		border-radius: 4px;
		background-color: var(--color-error);
		color: #000;
		transition: all 0.2s;
		align-self: flex-end;
	}

	.close-btn:hover {
		background: #f3f4f6;
		color: #000;
	}
</style>
