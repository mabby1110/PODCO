<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	let {
		controles,
		header,
		absolute,
		tituloBoton = 'controles'
	}: { controles?: Snippet; header?: Snippet; absolute?: boolean; tituloBoton?: string } = $props();

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
		if (event.altKey && event.key === '2') {
			event.preventDefault(); // Evita el comportamiento por defecto del navegador
			showFilter = !showFilter;
		}
		if (event.key === 'Escape') {
			showFilter = false;
		}
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
		class="panel {absolute ? 'panel-controls-local' : 'panel-controls'}"
		style="transform: translate({x}px, {y}px);"
	>
		<div class="header-actions" onmousedown={onMouseDown}>
			<div class="custom">
				{#if header}
					{@render header()}
				{/if}
			</div>
			<p class="panel-title">{tituloBoton}</p>
			<button class="butter honey" type="button" onclick={resetPosition}>◥</button>
			<button class="butter chile" type="button" onclick={() => (showFilter = false)}>✕</button>
		</div>
		<div class="content-actions">
			{#if controles}
				{@render controles()}
			{/if}
		</div>
	</div>
{/if}
<button
	class="butter honey {showFilter ? 'active' : ''}"
	onclick={() => (showFilter = !showFilter)}
>
	<img src="/options.svg" alt="options" />
</button>

<style>
	.panel-controls {
		position: fixed;
		top: 0;
		right: 0;
		display: flex;
		gap: var(--a);
		width: fit-content;
		max-width: 100vw;
		z-index: 99;
		display: flex;
		flex-direction: column;
	}
	.panel-controls-local {
		position: absolute;
		top: 0;
		right: 0;
		max-width: 40vw;
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		z-index: 99;
		display: flex;
		flex-direction: column;
	}
	.content-actions {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding: var(--a);
	}

	.header-actions:active {
		cursor: grabbing;
	}

	.header-actions {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: var(--a);
		cursor: grab;
		user-select: none;
		padding: var(--a) var(--a) 4px;
	}
	.header-actions .custom {
		flex-grow: 1;
		display: flex;
		flex-wrap: wrap;
		gap: 0 var(--a);
		align-items: center;
	}
	.header-actions.is-dragging > * {
		pointer-events: none;
	}
	.panel-title {
		flex-grow: 1;
	}
</style>
