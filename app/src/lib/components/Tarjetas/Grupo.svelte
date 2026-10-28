<!-- Grupo.svelte -->
<script>
	import { tick } from 'svelte';

	const LOTE = 20;

	let { agrupacion, showByDefault = false, children } = $props();
	let show = $derived(showByDefault);

	let groupTitle = $derived.by(() => agrupacion.columna);

	let listRef = $state();
	let sentinelRef = $state();
	let visibles = $state(LOTE);

	let total = $derived(agrupacion.items.length);
	let itemsVisibles = $derived(agrupacion.items.slice(0, visibles));
	let hayMas = $derived(visibles < total);

	async function handleToggle() {
		show = !show;
		if (!show) visibles = LOTE;
		await tick();
		listRef?.scrollIntoView({ block: 'start' });
	}

	$effect(() => {
		// leer `visibles` aquí hace que el observer se recree tras cada lote
		const actual = visibles;
		if (!show || actual >= total || !sentinelRef) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					visibles = Math.min(actual + LOTE, total);
				}
			},
			{ rootMargin: '200px' }
		);

		observer.observe(sentinelRef);
		return () => observer.disconnect();
	});
</script>

<div class="grupo" bind:this={listRef}>
	<button class="titulo milk" onclick={handleToggle}>
		<h2>{groupTitle} ({total})</h2>
	</button>
	{#if show}
		<div class="group-list">
			{#each itemsVisibles as elemento (elemento.id)}
				<div class="item">
					{@render children(elemento)}
				</div>
			{/each}
			{#if hayMas}
				<div bind:this={sentinelRef} class="sentinel"></div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.titulo {
		padding: var(--a);
		z-index: 9;
		width: fit-content;
		min-height: fit-content;
		position: sticky;
		top: 0;
		margin-bottom: var(--a);
	}
	.group-list {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		margin-bottom: var(--e);
	}
	.item {
		flex-shrink: 0;
		content-visibility: auto;
		contain-intrinsic-size: auto 120px; /* ajusta a la altura aprox. de tu tarjeta */
	}
	.sentinel {
		flex-shrink: 0;
		height: 20px;
	}
</style>