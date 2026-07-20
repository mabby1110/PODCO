<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	let {
		contenido,
		header,
		absolute,
		tituloBoton = 'boton'
	}: { contenido?: Snippet; header?: Snippet; absolute?: boolean; tituloBoton: string } = $props();

	let show = $state(false);

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
		if (event.altKey && event.key === '3') {
			event.preventDefault(); // Evita el comportamiento por defecto del navegador
			show = !show;
		}
		if (event.key === 'Escape') show = false;
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
		if (show) {
			setTimeout(calculateQuadrant, 0);
		}
	});

	onMount(() => {
		window.addEventListener('resize', calculateQuadrant);
		return () => window.removeEventListener('resize', calculateQuadrant);
	});
</script>

<svelte:window onkeydown={handleKeyDown} onmousemove={onMouseMove} onmouseup={onMouseUp} />

{#if show}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={panel}
		class="panel {quadrantY} {quadrantX} {absolute ? 'panel-controls-local' : 'panel-controls'}"
		style="transform: translate({x}px, {y}px);"
	>
		<div class="header-actions" onmousedown={onMouseDown}>
			{#if header}
			{@render header()}
			{/if}
			<p class="panel-title">{tituloBoton}</p>
			<button class="butter honey" type="button" onclick={resetPosition}>⇱</button>
			<button class="butter chile" type="button" onclick={() => (show = false)}>✕</button>
		</div>
		{#if contenido}
			{@render contenido()}
		{/if}
	</div>
{/if}
<button class="butter {show ? 'active' : ''}" onclick={() => (show = !show)}>
	{tituloBoton}
</button>

<style>
	.panel-controls {
		position: fixed;
		top: 0;
		right: var(--a);
		display: flex;
		gap: var(--a);
		max-width: 700px;
		width: 94%;
	}
	.panel-controls-local {
		position: sticky;
		top: 0;
		right: 0;
		max-width: 40vw;
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
	}
	.panel-controls.top,
	.panel-controls.bottom {
		flex-direction: column;
	}
	.panel-controls.left :global(.contenedor-agrupaciones:last-child),
	.panel-controls.left :global(.contenedor-filtro) {
		display: flex;
		justify-content: flex-end;
	}

	.panel-controls.right :global(.contenedor-agrupaciones:last-child),
	.panel-controls.right :global(.contenedor-filtro) {
		display: flex;
		justify-content: flex-start;
	}

	.panel-controls-local.left :global(.contenedor-agrupaciones:last-child),
	.panel-controls-local.left :global(.contenedor-filtro) {
		display: flex;
		justify-content: flex-end;
	}

	.panel-controls-local.right :global(.contenedor-agrupaciones:last-child),
	.panel-controls-local.right :global(.contenedor-filtro) {
		display: flex;
		justify-content: flex-start;
	}
	.header-actions:active {
		cursor: grabbing;
	}

	.header-actions {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--a);
		cursor: grab;
		user-select: none;
	}
	.panel-title {
		flex-grow: 1;
	}
</style>
