<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	let { controles, header }: { controles?: Snippet; header?: Snippet } = $props();

	let showFilter = $state(false);

	let x = $state(0);
	let y = $state(0);
	let isDragging = false;

	let startX = 0;
	let startY = 0;
	let initialX = 0;
	let initialY = 0;

	let panel: HTMLDivElement | undefined = $state();
	let quadrantY = $state('top');
	let quadrantX = $state('left');

	function calculateQuadrant() {
		if (!panel) return;
		const rect = panel.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		quadrantX = centerX > window.innerWidth / 2 ? 'right' : 'left';
		quadrantY = centerY > window.innerHeight / 2 ? 'bottom' : 'top';
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') showFilter = false;
	}

	function onMouseDown(event: MouseEvent) {
		isDragging = true;
		startX = event.clientX;
		startY = event.clientY;
		initialX = x;
		initialY = y;
	}

	function onMouseMove(event: MouseEvent) {
		if (!isDragging) return;
		x = initialX + (event.clientX - startX);
		y = initialY + (event.clientY - startY);
		calculateQuadrant();
	}

	function onMouseUp() {
		if (isDragging) {
			isDragging = false;
			calculateQuadrant();
		}
	}

	function resetPosition(event: MouseEvent) {
		event.stopPropagation();
		x = 0;
		y = 0;
		setTimeout(calculateQuadrant, 0);
	}

	$effect(() => {
		if (showFilter) {
			setTimeout(calculateQuadrant, 0);
		}
	});

	onMount(() => {
		window.addEventListener('resize', calculateQuadrant);
		return () => window.removeEventListener('resize', calculateQuadrant);
	});
</script>

<svelte:window onkeydown={handleKeyDown} onmousemove={onMouseMove} onmouseup={onMouseUp} />

{#if showFilter}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={panel}
		class="panel-controls {quadrantY} {quadrantX}"
		style="transform: translate({x}px, {y}px);"
		onmousedown={onMouseDown}
	>
		<div class="header-actions">
			<button class="butter" type="button" onclick={resetPosition}>Resetear posición</button>
			{#if header}
				{@render header()}
			{/if}
			<button class="close-btn" type="button" onclick={() => (showFilter = false)}>x</button>
		</div>
		{#if controles}
			{@render controles()}
		{/if}
	</div>
{:else}
	<button class="butter" onclick={() => (showFilter = true)}> +Filtros </button>
{/if}

<style>
	.panel-controls {
		position: fixed;
		max-width: 90vw;
		top: 3.6rem;
		display: flex;
		gap: var(--a);
		cursor: grab;
		user-select: none;
		padding: 1rem;
	}

	.panel-controls.top {
		flex-direction: column;
	}

	.panel-controls.bottom {
		flex-direction: column-reverse;
	}
	.panel-controls.left :global(.contenedor-agrupaciones:last-child),
	.panel-controls.left :global(.contenedor-filtro) {
		display: flex;
		justify-content: flex-start;
	}

	.panel-controls.right :global(.contenedor-agrupaciones:last-child),
	.panel-controls.right :global(.contenedor-filtro) {
		display: flex;
		justify-content: flex-end;
	}

	.panel-controls:active {
		cursor: grabbing;
	}

	.header-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: var(--a);
		width: 100%;
	}
</style>
