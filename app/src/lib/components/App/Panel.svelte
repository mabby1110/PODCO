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
	let isMaximized = $state(false); // Estado para controlar la maximización

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
			event.preventDefault();
			show = !show;
		}
		if (event.key === 'Escape') show = false;
	}

	function onMouseDown(event: MouseEvent) {
		if (isMaximized) return; // Desactiva arrastre si está maximizado
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
		isMaximized = false;
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
		class="panel {quadrantY} {quadrantX} {absolute
			? 'panel-controls-local'
			: 'panel-controls'} {isMaximized ? 'maximized' : ''}"
		style={isMaximized ? '' : `transform: translate(${x}px, ${y}px);`}
	>
		<div class="header-actions" onmousedown={onMouseDown}>
			<button class="butter chile" type="button" onclick={() => (show = false)}>✕</button>
            <button class="butter honey" type="button" onclick={resetPosition}>◥</button>
			<p class="panel-title">{tituloBoton}</p>
			{#if header}
				{@render header()}
			{/if}
			<button
				class="butter honey max-window"
				type="button"
				onclick={(e) => {
					e.stopPropagation();
					isMaximized = !isMaximized;
				}}
			>
				<img src="/max-win.svg" alt="max-win" />
			</button>
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
		align-items: center;
		flex-flow: row;
		gap: var(--a);
		cursor: grab;
		user-select: none;
	}
	.panel-title {
		flex-grow: 1;
	}

	/* Reglas para la ventana maximizada */
	.maximized {
		position: fixed !important;
		top: 1vh !important;
		left: 1vw !important;
		right: auto !important;
		width: 98vw !important;
		height: 90vh !important;
		max-width: none !important;
		z-index: 9999;
	}

	.maximized .header-actions {
		cursor: default;
	}
	.maximized .header-actions:active {
		cursor: default;
	}
</style>
