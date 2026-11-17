<script lang="ts">
	import { StoreAplicacion } from '$lib/stores/app/StoreAplicacion.svelte';
	import { StoreHotkeys } from '$lib/stores/app/StoreHotkeys.svelte';
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	let {
		acciones,
		header,
		absolute
	}: {
		acciones?: Snippet;
		header?: Snippet;
		absolute?: boolean;
	} = $props();

	let isMaximized = $state(false);

	let x = $state(0);
	let y = $state(0);
	let isDragging = $state(false);

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

	function onMouseDown(event: MouseEvent) {
		// Solo permitir arrastre si no está maximizado Y si se usa el botón central (botón 1)
		if (isMaximized || event.button !== 0) return;

		// Evita el comportamiento de auto-scroll por defecto del navegador en Windows/Linux

		isDragging = true;
		startX = event.clientX;
		startY = event.clientY;
		initialX = x;
		initialY = y;
	}

	function onMouseMove(event: MouseEvent) {
		if (!isDragging) return;
		// Restaurados los signos '-' que faltaban en el cálculo
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
	let show = $derived(StoreAplicacion.value.controles);

	$effect(() => {
		if (show) {
			setTimeout(calculateQuadrant, 0);
		}
	});

	$effect(() => {
		if (!show) return;
		return StoreHotkeys.registerEscape('controles', () => StoreAplicacion.set('controles', false));
	});

	$effect(() => {
		return StoreHotkeys.registerEscape('retraer', () => StoreAplicacion.set('retraer', false));
	});
	onMount(() => {
		window.addEventListener('resize', calculateQuadrant);

		const unregisterControles = StoreHotkeys.register({
			id: 'controles',
			key: 'q',
			label: 'Abrir/cerrar panel de opciones',
			action: () => {
				StoreAplicacion.toggle('controles');
			}
		});
		const unregisterRetraer = StoreHotkeys.register({
			id: 'retraer',
			key: 'e',
			label: 'retraer/expandir grupos',
			action: () => {
				StoreAplicacion.toggle('retraer');
			}
		});

		return () => {
			window.removeEventListener('resize', calculateQuadrant);
			unregisterControles();
			unregisterRetraer();
		};
	});
</script>

<svelte:window onmousemove={onMouseMove} onmouseup={onMouseUp} />

{#if show}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- Evento mousedown movido a todo el panel y control dinámico del cursor -->
	<div
		bind:this={panel}
		class="honey {absolute ? 'panel-controls-local' : 'panel-controls'} {isMaximized
			? 'maximized'
			: ''} {isDragging ? 'dragging' : ''}"
		style={isMaximized ? '' : `transform: translate(${x}px, ${y}px);`}
	>
		<div class="header-actions" onmousedown={onMouseDown}>
			{#if header}
				<div class="custom">
					{@render header()}
				</div>
			{/if}
			<div class="default">
				<button class="jelly" type="button" onclick={resetPosition}>◥</button>
				<button
					class="jelly rojo accion"
					type="button"
					onclick={() => StoreAplicacion.toggle('controles')}>✕</button
				>
			</div>
		</div>
		<div class="contenido">
			{#if acciones}
				{@render acciones()}
			{/if}
		</div>
	</div>
{/if}

<button
	class="control honey"
	class:activo={show}
	onclick={() => StoreAplicacion.toggle('controles')}
>
	<img src="/options.svg" alt="options" />
	{#if StoreHotkeys.active && StoreHotkeys.get('q')}
		<span class="hotkey-badge">
			{StoreHotkeys.get('q')?.key.toUpperCase()}
		</span>
	{/if}
</button>

<style>
	.panel-controls {
		position: fixed;
		top: var(--a);
		right: var(--a);
		max-width: var(--i);
		width: 96vw;
		height: fit-content;
		max-height: 80%;
		min-height: var(--g);
		display: flex;
		gap: var(--a);
		flex-direction: column;
	}

	/* Regla añadida para mostrar el cursor agarrando cuando movemos */
	.dragging {
		cursor: grabbing !important;
		user-select: none;
	}

	.header-actions {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		flex-flow: row;
		gap: var(--a);
		padding: var(--a) var(--a) 4px;
	}

	.header-actions .custom {
		flex-grow: 1;
		display: flex;
		gap: var(--a);
	}

	.header-actions .default {
		display: flex;
		gap: var(--a);
	}

	.contenido {
		padding: var(--a);
		overflow: auto;
	}

	.maximized {
		position: fixed !important;
		top: 0 !important;
		width: 100% !important;
		height: 100% !important;
		max-height: 88dvh !important;
		max-width: 100dvw !important;
		min-height: var(--g);
	}

	.control {
		position: relative;
		padding: var(--y);
		height: var(--d);
	}
	.custom {
		display: flex;
		flex-wrap: wrap;
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
</style>
