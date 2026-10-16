<script lang="ts">
	import { StorePedidoEditar } from '$lib/stores/pedidos/StorePedidoEditar.svelte';
	import { onMount } from 'svelte';
	import TarjetaPedidoEditar from './TarjetaPedidoEditar.svelte';
	import TarjetaContextoOportunidad from './TarjetaContextoOportunidad.svelte';

	let isMaximized = $state(false);

	// Posición
	let x = $state(0);
	let y = $state(0);
	let isDragging = $state(false);

	// Tamaño (Redimensionamiento)
	let w: number | undefined = $state();
	let h: number | undefined = $state();
	let isResizing = $state(false);

	let startX = 0;
	let startY = 0;
	let initialX = 0;
	let initialY = 0;
	let startW = 0;
	let startH = 0;

	let panel: HTMLDivElement | undefined = $state();
	let quadrantY = $state('top');
	let quadrantX = $state('left');

	let panelStyle = $derived(
		isMaximized
			? ''
			: `transform: translate(${x}px, ${y}px);` +
					(w ? ` width: ${w}px; max-width: none;` : '') +
					(h ? ` height: ${h}px; max-height: none;` : '')
	);
	
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
			StorePedidoEditar.toggleModal(true);
		}
		if (event.key === 'Escape') StorePedidoEditar.toggleModal(false);
	}
	function onMouseDown(event: MouseEvent) {
		if (isMaximized) return;
		isDragging = true;
		startX = event.clientX;
		startY = event.clientY;
		initialX = x;
		initialY = y;
	}
	function onResizeMouseDown(event: MouseEvent) {
		if (isMaximized) return;
		event.stopPropagation();
		isResizing = true;
		startX = event.clientX;
		startY = event.clientY;
		initialX = x; // <-- nuevo
		if (panel) {
			const rect = panel.getBoundingClientRect();
			startW = rect.width;
			startH = rect.height;
		}
	}
	function onMouseMove(event: MouseEvent) {
		if (isDragging) {
			x = initialX + (event.clientX - startX);
			y = initialY + (event.clientY - startY);
			calculateQuadrant();
		} else if (isResizing) {
			// Esquina inferior izquierda: arrastrar a la izquierda aumenta el ancho,
			// arrastrar hacia abajo aumenta el alto. El borde derecho y el superior quedan fijos.
			const newW = Math.max(300, startW + (startX - event.clientX));
			const newH = Math.max(200, startH + (event.clientY - startY));

			w = newW;
			h = newH;

			// Compensa el centrado automático (margin-inline: auto) para fijar el borde derecho
			x = initialX + (startW - newW) / 2;
		}
	}
	function onMouseUp() {
		if (isDragging || isResizing) {
			isDragging = false;
			isResizing = false;
			calculateQuadrant();
		}
	}

	$effect(() => {
		if (StorePedidoEditar.modal) {
			// Resetea las medidas originales al abrir
			w = undefined;
			h = undefined;

			// Opcional: si también quieres que la posición vuelva al origen
			x = 0;
			y = 0;

			isMaximized = false;
			setTimeout(calculateQuadrant, 0);
		}
	});

	onMount(() => {
		window.addEventListener('resize', calculateQuadrant);
		return () => window.removeEventListener('resize', calculateQuadrant);
	});
</script>

<svelte:window onkeydown={handleKeyDown} onmousemove={onMouseMove} onmouseup={onMouseUp} />
<svelte:body class:resizing={isResizing} class:dragging={isDragging} />

{#if StorePedidoEditar.modal}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={panel}
		class="honey panel-controls {isMaximized ? 'maximized' : ''}"
		style={panelStyle}
	>
		<div class="header-actions" onmousedown={onMouseDown}>
			<p class="panel-title">Editar Pedido</p>
			<button
				class="jelly max-window"
				type="button"
				onclick={(e) => {
					e.stopPropagation();
					isMaximized = !isMaximized;
				}}
			>
				<img src="/max-win.svg" alt="max-win" />
			</button>
			<button class="butter rojo" type="button" onclick={() => StorePedidoEditar.toggleModal()}>
				✕
			</button>
		</div>

		<div class="contenido">
			<TarjetaContextoOportunidad />
			<TarjetaPedidoEditar />
		</div>

		{#if !isMaximized}
			<!-- Esquina invisible para reajustar -->
			<div class="resize-handle" onmousedown={onResizeMouseDown}></div>
		{/if}
	</div>
{/if}

<style>
	.resize-handle {
		position: absolute;
		bottom: 0;
		width: 40px;
		height: 40px;
		z-index: 100;
		cursor: sw-resize;
		user-select: none;
	}

	:global(body.resizing) {
		cursor: sw-resize !important;
	}

	.panel-controls {
		position: fixed;
		top: var(--a);
		left: 0;
		right: 0;

		width: 100%;
		max-width: 600px;
		margin-inline: auto;

		height: fit-content;
		max-height: 80%;
		min-height: var(--g);

		display: flex;
		gap: var(--a);
		flex-direction: column;
		z-index: 99;
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
		gap: var(--y);
		cursor: grab;
		user-select: none;
		padding: var(--a) var(--a) 4px;
	}
	.panel-title {
		flex-grow: 1;
	}
	.contenido {
		position: relative;
		flex-grow: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding: 0 var(--a);
	}

	.maximized {
		position: fixed !important;
		top: 0 !important;
		width: 100% !important;
		height: 100% !important;
		max-height: 100dvh !important;
		max-width: 100dvw !important;
		z-index: 9999;
		min-height: var(--g);
	}
	.maximized .header-actions {
		cursor: default;
	}
	.maximized .header-actions:active {
		cursor: default;
	}
	.jelly {
		height: var(--d);
		padding: 0;
	}
</style>
