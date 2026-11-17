<script lang="ts" generics="T extends { id: string | number }">
	import type { Snippet } from 'svelte';

	const LOTE = 20;

	let {
		items,
		children
	}: {
		items: any;
		children: Snippet<[T]>;
	} = $props();

	let sentinelRef = $state<HTMLElement>();
	let visibles = $state(LOTE);
	let total = $derived(items.length);

	let itemsVisibles = $derived(items.slice(0, visibles));
	let hayMas = $derived(visibles < total);

	// Reinicia el lote cuando cambia la lista (filtros, orden, etc.)
	$effect(() => {
		items;
		visibles = LOTE;
	});

	function cargarMas() {
		if (!hayMas) return;
		visibles = Math.min(visibles + LOTE, total);
	}

	$effect(() => {
		if (!hayMas || !sentinelRef) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) cargarMas();
			},
			{ rootMargin: '200px' }
		);

		observer.observe(sentinelRef);

		return () => observer.disconnect();
	});
</script>

{#each itemsVisibles as elemento (elemento.id)}
	{@render children(elemento)}
{:else}
	<div class="no-results">
		<p>No se encontraron datos.</p>
	</div>
{/each}

{#if hayMas}
	<div bind:this={sentinelRef} class="sentinel"></div>
{/if}

<style>
	.sentinel {
		flex-shrink: 0;
		height: 20px;
	}
</style>
