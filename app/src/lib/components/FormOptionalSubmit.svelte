<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		submitUpdate = $bindable(),
		submitCancel = $bindable()
	}: {
		children?: Snippet;
		submitUpdate: boolean;
		submitCancel: boolean;
	} = $props();
	let isOpen = $state(false);
	function toggleUpdate() {
		submitUpdate = true;
		submitCancel = false;
		isOpen = true;
	}
	function toggleCancel() {
		submitCancel = true;
		submitUpdate = false;
		isOpen = true;
	}
	function close() {
		isOpen = false;
		submitUpdate = false;
		submitCancel = false;
	}
</script>

{#if !isOpen}
	<button class="butter" type="button" onclick={toggleUpdate}> Postergar </button>
	<button class="butter" type="button" onclick={toggleCancel}> Perder </button>
{:else}
	<button class="close-btn" type="button" onclick={close}>✕</button>
{/if}

<style>
	.close-btn {
		border: none;
		cursor: pointer;
		width: var(--d);
		height: var(--d);
		border-radius: 4px;
		background-color: var(--color-error);
		color: #000;
		transition: all 0.2s;
	}
	.close-btn:hover {
		background: #f3f4f6;
		color: #000;
	}
</style>
