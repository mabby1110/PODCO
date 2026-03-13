<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		submitUpdate = $bindable(),
		submitOp = $bindable(),
		submitCancel = $bindable()
	}: {
		children?: Snippet;
		submitUpdate: boolean;
		submitOp: boolean;
		submitCancel: boolean;
	} = $props();

	let isOpen = $state(false);
	function toggleOp() {
		submitOp = true;
		submitUpdate = false;
		submitCancel = false;
		isOpen = true;
	}
	function toggleUpdate() {
		submitUpdate = true;
		submitOp = false;
		submitCancel = false;
		isOpen = true;
	}
	function toggleCancel() {
		submitCancel = true;
		submitUpdate = false;
		submitOp = false;
		isOpen = true;
	}
	function close() {
		isOpen = false;
		submitOp = false;
		submitUpdate = false;
		submitOp = false;
		submitCancel = false;
	}
</script>

{#if !isOpen}
	<button class="butter" type="button" onclick={toggleUpdate}>Postergar</button>
	<button class="butter" type="button" onclick={toggleCancel}>Descartar</button>
	<button class="butter" type="button" onclick={toggleOp}>+Oportunidad</button>
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
