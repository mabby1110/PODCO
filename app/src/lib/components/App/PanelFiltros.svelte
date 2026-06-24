<script lang="ts">
	import type { Snippet } from 'svelte';

	let { controles }: { controles?: Snippet } = $props();
	let showFilter = $derived(false);

	function handleKeyDown(event) {
		if (event.key === 'Escape') {
			showFilter = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />
{#if showFilter}
	<button class="close-btn" type="button" onclick={() => (showFilter = false)}>x</button>
	{#if controles}
		<div class="controles">
			{@render controles()}
		</div>
	{/if}
{:else}
	<button class="butter" onclick={() => (showFilter = true)}> +Filtros </button>
{/if}

<style>
	.controles {
		position: absolute;
		top: 7vh;
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
	}
</style>
