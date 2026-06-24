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
	<div class="filtros">
		{#if controles}
			{@render controles()}
		{/if}
	</div>
{:else}
	<button class="butter" onclick={() => (showFilter = true)}> +Filtros </button>
{/if}