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
	<button class="titulo butter" onclick={handleToggle}>
		<span>({total})</span>
		<h2>{groupTitle}</h2>
	</button>
	{#if show}
		<div class="group-list">
			{#each itemsVisibles as elemento (elemento.id)}
				{@render children(elemento)}
			{/each}
			{#if hayMas}
				<div bind:this={sentinelRef} class="sentinel"></div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.grupo {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
	.titulo {
		padding: var(--b);
		z-index: 9;
		width: 100%;
		min-height: fit-content;
		position: sticky;
		top: 0;
		text-align: start;
		display: flex;
		gap: var(--a);
	}
	.group-list {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		margin-bottom: var(--e);
	}
	.sentinel {
		flex-shrink: 0;
		height: 20px;
	}
</style>
