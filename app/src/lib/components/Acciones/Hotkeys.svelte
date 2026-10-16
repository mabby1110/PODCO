<!-- $lib/components/Hotkeys.svelte -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { StoreHotkeys } from '$lib/stores/StoreHotkeys.svelte';

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

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && active) {
			cancel();
			event.preventDefault();
			return;
		}

		if (
			event.shiftKey &&
			event.code === 'Space' &&
			!event.ctrlKey &&
			!event.altKey &&
			!event.metaKey &&
			!isTyping(event.target)
		) {
			event.preventDefault();
			active = true;
			StoreHotkeys.setActive(true);

			clearTimeout(timeout);
			timeout = setTimeout(cancel, 4000);
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

	onMount(() => {
		// const onMouseMove = () => cancel();
		const onBlur = () => cancel();
		const onFocusIn = (event: FocusEvent) => {
			if (isTyping(event.target)) cancel();
		};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('blur', onBlur);
		window.addEventListener('focusin', onFocusIn);

		return () => {
			clearTimeout(timeout);
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('blur', onBlur);
			window.removeEventListener('focusin', onFocusIn);
		};
	});
</script>

{#if active}
	<div class="hotkey-hint" role="status">
		Comando… <kbd>Q</kbd> Buscar · <kbd>A</kbd> Navegador ·
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
