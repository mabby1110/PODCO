<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { StoreHotkeys } from '$lib/stores/app/StoreHotkeys.svelte';
	import { StoreAplicacion } from '$lib/stores/app/StoreAplicacion.svelte';

	let active = $state(false);
	let hints = $state<{ element: HTMLElement; label: string; rect: DOMRect }[]>([]);
	let typed = $state('');

	let timeout: ReturnType<typeof setTimeout>;
	let observer: MutationObserver;

	const alphabet = 'ASDFGHJKLQWERTYUIOPZXCVBNM';

	function cancel() {
		active = false;
		typed = '';
		hints = [];
		StoreHotkeys.setActive(false);
		clearTimeout(timeout);
	}
	function isTyping(target: EventTarget | null): boolean {
		return (
			target instanceof HTMLElement &&
			(target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
		);
	}
	function isVisible(element: HTMLElement): boolean {
		const style = getComputedStyle(element);
		const rect = element.getBoundingClientRect();

		return (
			style.display !== 'none' &&
			style.visibility !== 'hidden' &&
			Number(style.opacity) > 0 &&
			rect.width > 0 &&
			rect.height > 0 &&
			rect.bottom > 0 &&
			rect.right > 0 &&
			rect.top < window.innerHeight &&
			rect.left < window.innerWidth &&
			!element.hasAttribute('disabled') &&
			element.getAttribute('aria-disabled') !== 'true'
		);
	}
	function generateLabels(count: number): string[] {
		const labels: string[] = [];

		for (let i = 0; i < alphabet.length && labels.length < count; i++) {
			for (let j = 0; j < alphabet.length && labels.length < count; j++) {
				labels.push(alphabet[i] + alphabet[j]);
			}
		}

		return labels;
	}
	function scanDOM() {
		const container = document.querySelector('.vista .contenido');

		if (!container) {
			hints = [];
			return;
		}

		const elements = Array.from(
			container.querySelectorAll<HTMLElement>(
				'a[href], button, [role="button"], input[type="button"], input[type="submit"], summary, [onclick], [tabindex]:not([tabindex="-1"])'
			)
		).filter((element) => isVisible(element));
		const labels = generateLabels(elements.length);

		hints = elements.map((element, index) => ({
			element,
			label: labels[index],
			rect: element.getBoundingClientRect()
		}));
	}
	async function activate() {
		active = true;
		typed = '';
		StoreHotkeys.setActive(true);

		await tick();
		scanDOM();
	}
	async function refreshHints() {
		if (!active) return;

		await tick();

		scanDOM();
	}
	function parentPath(pathname: string): string | null {
		const parts = pathname.split('/').filter(Boolean);

		if (parts.length <= 1) return null;

		parts.pop();

		return '/' + parts.join('/');
	}
	async function goUp() {
		const parent = parentPath(page.url.pathname);

		if (!parent) return;

		typed = '';
		hints = [];

		await goto(parent);
		await tick();
		await refreshHints();
	}
	async function executeHint(label: string) {
		const hint = hints.find((item) => item.label === label);

		if (!hint || !hint.element.isConnected) {
			await refreshHints();
			return;
		}

		const element = hint.element;

		// Limpiar las etiquetas anteriores sin desactivar el modo.
		typed = '';
		hints = [];

		element.focus({ preventScroll: true });
		element.click();

		// Esperar a que Svelte actualice el DOM.
		await tick();
		await refreshHints();
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

			if (active) {
				cancel();
			} else {
				activate();
			}

			return;
		}

		if (!active || event.repeat || isTyping(event.target)) return;

		if (event.key === 'Backspace') {
			event.preventDefault();

			if (typed) {
				typed = typed.slice(0, -1);
				scanDOM();

				if (typed) {
					hints = hints.filter((hint) => hint.label.startsWith(typed));
				}

				return;
			}

			goUp();
			return;
		}

		if (['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) return;

		const key = event.key.toLowerCase();

		// Prioridad a comandos fijos registrados.
		if (StoreHotkeys.get(key)) {
			event.preventDefault();
			event.stopPropagation();

			typed = '';
			StoreHotkeys.execute(key);

			refreshHints();
			return;
		}

		// Navegación mediante etiquetas de dos letras.
		const letter = event.key.toUpperCase();

		if (!alphabet.includes(letter)) return;

		event.preventDefault();

		typed += letter;

		const matches = hints.filter((hint) => hint.label.startsWith(typed));

		if (matches.length === 1 && matches[0].label === typed) {
			executeHint(typed);
			return;
		}

		if (matches.length === 0) {
			typed = '';
			return;
		}

		hints = matches;
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

			if (active) {
				cancel();
			} else {
				activate();
			}
		}
	}

	function handleClick() {
		// if (active) cancel();
	}

	onMount(() => {
		observer = new MutationObserver(() => {
			if (active) scanDOM();
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['class', 'style', 'hidden', 'disabled']
		});

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('mousedown', handleMouseDown);
		window.addEventListener('click', handleClick);

		const handleResize = () => {
			if (active) scanDOM();
		};

		window.addEventListener('resize', handleResize);
		window.addEventListener('scroll', handleResize, true);

		return () => {
			clearTimeout(timeout);
			observer.disconnect();

			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('mousedown', handleMouseDown);
			window.removeEventListener('click', handleClick);
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('scroll', handleResize, true);
		};
	});
</script>

{#if active}
	<div class="hint-container">
		{#each hints as hint (hint.label)}
			<div
				class="hint"
				class:matched={typed.length > 0 && hint.label.startsWith(typed)}
				style:left="{hint.rect.left + hint.rect.width / 2}px"
				style:top="{hint.rect.top + hint.rect.height / 2}px"
			>
				{hint.label}
			</div>
		{/each}
	</div>

	<div class="hotkey-status">
		<span>{typed || 'Navegar'}</span>
		<span>{hints.length} elementos</span>
		<kbd>Esc</kbd>
	</div>
{/if}

<style>
	.hint-container {
		position: fixed;
		inset: 0;
		z-index: 999999;
		pointer-events: none;
	}

	.hint {
		position: absolute;
		transform: translate(-50%, -50%);
		background: #facc15;
		color: #111827;
		border: 1px solid #ca8a04;
		border-radius: 4px;
		padding: 2px 5px;
		font-size: 12px;
		font-weight: 900;
		font-family: monospace;
		line-height: 1.3;
		box-shadow: 0 2px 5px #0005;
		pointer-events: none;
	}

	.hint.matched {
		background: #22c55e;
		color: white;
		border-color: #15803d;
	}

	.hotkey-status {
		position: fixed;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 1000000;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 14px;
		background: #18181b;
		color: white;
		border-radius: 8px;
		font-size: 13px;
		box-shadow: 0 4px 16px #0005;
		pointer-events: none;
	}

	.hotkey-status kbd {
		padding: 2px 6px;
		border: 1px solid #71717a;
		border-radius: 4px;
		font-family: monospace;
	}
</style>
