<!-- Grupo.svelte -->
<script>
	import { appState } from '$lib/stores/appState.svelte';
	import { tick } from 'svelte';

	let { agrupacion, showByDefault = false, children } = $props();
	let show = $derived(showByDefault);

	let groupTitle = $derived.by(() => {
		console.log(typeof agrupacion.columna, agrupacion.columna.cantidad);
		return agrupacion.columna;
	});

	let listRef = $state();

	async function handleToggle() {
		appState.toggleMin();
		await tick();

		if (listRef) {
			listRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}
</script>

<div class="grupo" bind:this={listRef}>
	<button class="titulo jelly" onclick={handleToggle}>
		<h2>{groupTitle} ({agrupacion.items.length})</h2>
	</button>
	{#if show}
		<div class="group-list">
			{@render children()}
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
</style>
