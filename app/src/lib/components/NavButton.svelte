<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { appState } from '$lib/stores/appState.svelte';
	import ControlsPanel from './ControlsPanel.svelte';
	import Logout from './Logout.svelte';

	let expanded = $derived($appState.pageActions);
	let isDragging = $state(false);
	let dragTimeout: ReturnType<typeof setTimeout> | null = null;
	let startX = $state(0);
	let startY = $state(0);
	let offsetX = $state(0);
	let offsetY = $state(0);
	let storeState = $state({ panelPosition: { x: 0, y: 0 } });
	let panelElement: HTMLElement;
	let panelToolsElement = $state<HTMLElement | null>(null);

	let blockNextClick = false;

	$effect(() => {
		const unsubscribe = appState.subscribe((state) => {
			storeState = state;
			offsetX = state.panelPosition.x;
			offsetY = state.panelPosition.y;
		});
		return unsubscribe;
	});

	$effect(() => {
		const cancel = (e: MouseEvent) => {
			if (!blockNextClick) return;
			e.stopPropagation();
			e.preventDefault();
			blockNextClick = false;
		};

		window.addEventListener('click', cancel, true);
		return () => window.removeEventListener('click', cancel, true);
	});

	function handlePointerDown(e: PointerEvent) {
		e.stopPropagation();
		e.preventDefault();
		blockNextClick = true;

		const target = e.target as HTMLElement;
		if (target.closest('.nav-links')) return;

		startX = e.clientX - offsetX;
		startY = e.clientY - offsetY;

		dragTimeout = setTimeout(() => {
			isDragging = true;
			panelElement?.setPointerCapture(e.pointerId);
		}, 150);
	}

	function handlePointerMove(e: PointerEvent) {
		e.stopPropagation();
		if (!isDragging) return;

		let x = e.clientX - startX;
		let y = e.clientY - startY;

		const rect = panelElement.getBoundingClientRect();

		const minX = -rect.left + offsetX;
		const minY = -rect.top + offsetY;
		const maxX = window.innerWidth - rect.right + offsetX;
		const maxY = window.innerHeight - rect.bottom + offsetY;

		if (x < minX) x = minX;
		if (x > maxX) x = maxX;
		if (y < minY) y = minY;
		if (y > maxY) y = maxY;

		offsetX = x;
		offsetY = y;
	}

	function handlePointerUp(e: PointerEvent) {
		e.stopPropagation();
		e.preventDefault();

		if (dragTimeout) {
			clearTimeout(dragTimeout);
			dragTimeout = null;
		}

		if (isDragging) {
			appState.setPanelPosition(offsetX, offsetY);
		} else {
			const target = e.target as HTMLElement;
			if (!target.closest('.nav-links')) {
				appState.togglePageActions();
				if (expanded) {
					requestAnimationFrame(() => {
						requestAnimationFrame(clampToViewport);
					});
				}
			}
		}

		isDragging = false;
		panelElement?.releasePointerCapture(e.pointerId);
	}

	function handlePointerCancel(e: PointerEvent) {
		e.stopPropagation();
		if (dragTimeout) {
			clearTimeout(dragTimeout);
			dragTimeout = null;
		}
		isDragging = false;
	}

	function clampToViewport() {
		if (!panelElement || !panelToolsElement) return;

		const panelRect = panelElement.getBoundingClientRect();
		const toolsRect = panelToolsElement.getBoundingClientRect();

		let x = offsetX;
		let y = offsetY;

		if (panelRect.right > window.innerWidth) {
			x -= panelRect.right - window.innerWidth;
		}

		if (panelRect.left < 0) {
			x -= panelRect.left;
		}

		if (panelRect.bottom + toolsRect.height > window.innerHeight) {
			y -= panelRect.bottom + toolsRect.height - window.innerHeight;
		}

		if (panelRect.top < 0) {
			y -= panelRect.top;
		}

		offsetX = x;
		offsetY = y;
		appState.setPanelPosition(x, y);
	}
</script>

<div
	class="nav-container"
	style="transform: translate({offsetX}px, {offsetY}px);"

>
	{#if $appState.pageActions}
		<div bind:this={panelToolsElement}>
			<ControlsPanel />
		</div>
		<div class="page-controls">
			<Logout />
			<button
				in:fade={{ delay: 300, duration: 300 }}
				class="butter actions-button"
				onclick={(e) => {
					e.stopPropagation();
					e.preventDefault();
					appState.resetPanelPosition();
				}}
			>
				Resetear posición
			</button>
		</div>
	{/if}

	<button
		bind:this={panelElement}
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerCancel}
		onclick={(e) => {
			e.stopPropagation();
			e.preventDefault();
		}}
		class="butter"
		class:dragging={isDragging}
	>
		<div class="logo">
			<img src="bms-logo.svg" alt="BMS" />
			{#if expanded}
				<div class="title" in:slide={{ axis: 'x' }}>
					<p>COMPONENTES Y EQUIPOS</p>
					<p>INDUSTRIALES</p>
				</div>
			{/if}
		</div>
	</button>
</div>

<style>
	.nav-container {
		position: fixed;
		bottom: var(--a);
		right: var(--a);
		align-items: end;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		gap: var(--a);
		max-width: 96vw;
		flex-wrap: wrap;
	}

	button {
		background: var(--y2k);
		backdrop-filter: blur(4px);
		border: 1px solid var(--color-muted);
		border-radius: var(--a);
		cursor: pointer;
		touch-action: none;
		user-select: none;
		padding: 4px var(--a);
		transition:
			background-color 0.2s,
			transform 0.1s;
		box-shadow: none;
		width: fit-content;
	}

	.butter.dragging {
		cursor: move;
		background-color: var(--color-highlight);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
	}

	.logo {
		display: flex;
		align-items: center;
		gap: var(--b);
		width: fit-content;
	}

	.logo img {
		pointer-events: none;
		height: 30px;
	}

	.title {
		white-space: nowrap;
		font-size: 0.85rem;
		line-height: 1.2;
	}

	.title p {
		margin: 0;
		font-weight: 600;
	}

	.actions-button {
		background-color: var(--color-highlight);
		width: fit-content;
	}

	.page-controls {
		display: flex;
		gap: var(--a);
	}
</style>
