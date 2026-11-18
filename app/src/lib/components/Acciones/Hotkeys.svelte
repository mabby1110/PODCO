<!-- $lib/components/Hotkeys.svelte -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { StoreHotkeys } from '$lib/stores/app/StoreHotkeys.svelte';
	import { StoreAplicacion } from '$lib/stores/app/StoreAplicacion.svelte';

	let active = $state(false);
	let timeout: ReturnType<typeof setTimeout>;

	function cancel() {
		active = false;
		StoreHotkeys.setActive(false);
		clearTimeout(timeout);
	}

	function isTyping(target: EventTarget | null): boolean {
		return (
			target instanceof HTMLElement &&
			(target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
		);
	}

	function activate() {
		active = true;
		StoreHotkeys.setActive(true);

		clearTimeout(timeout);
		timeout = setTimeout(cancel, 8000);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (active) {
				cancel();
				event.preventDefault();
				return;
			}

			StoreHotkeys.escape();
			return;
		}

		if (event.shiftKey && event.code === 'Space') {
			event.preventDefault();
			activate();
			return;
		}

		if (!active || event.repeat) return;

		// Ignorar teclas modificadoras.
		if (['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) {
			return;
		}

		const key = event.key.toLowerCase();
		cancel();

		// Solo consumir la tecla si hay un comando registrado.
		if (StoreHotkeys.get(key)) {
			event.preventDefault();
			event.stopPropagation();
			StoreHotkeys.execute(key);
		}
	}

	function handleMouseDown(event: MouseEvent) {
		if (
			event.button === 1 &&
			!event.ctrlKey &&
			!event.altKey &&
			!event.metaKey &&
			!isTyping(event.target)
		) {
			event.preventDefault();
			activate();
		}
	}

	onMount(() => {
		const onMouseClick = () => cancel();
		const onBlur = () => cancel();
		const onFocusIn = (event: FocusEvent) => {
			if (isTyping(event.target)) cancel();
		};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('mousedown', handleMouseDown);
		window.addEventListener('click', onMouseClick);
		window.addEventListener('blur', onBlur);
		window.addEventListener('focusin', onFocusIn);

		return () => {
			clearTimeout(timeout);
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('mousedown', handleMouseDown);
			window.removeEventListener('click', onMouseClick);
			window.removeEventListener('blur', onBlur);
			window.removeEventListener('focusin', onFocusIn);
		};
	});
</script>

{#if active}
	<div class="hotkey-hint" role="status">
		<kbd>Q</kbd> Buscar
		<kbd>E</kbd>
		{StoreAplicacion.value.retraer ? 'Retraer' : 'Mostrar'} Lista
		<kbd>Esc</kbd> Cancelar
	</div>
{/if}

<style>
	.hotkey-hint {
		position: fixed;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 9999;
		padding: 0.65rem 1rem;
		border: 1px solid var(--color-border, #888);
		border-radius: 0.5rem;
		background: var(--color-background, Canvas);
		color: var(--color-foreground, CanvasText);
		box-shadow: 0 4px 16px #0002;
		pointer-events: none;
	}

	kbd {
		padding: 0.1rem 0.3rem;
		border: 1px solid #8888;
		border-radius: 0.25rem;
		font-family: monospace;
	}
</style>
