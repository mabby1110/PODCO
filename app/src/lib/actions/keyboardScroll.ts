import type { Action } from 'svelte/action';

export interface ArrowScrollOptions {
	/** Píxeles por pulsación (default 80) */
	step?: number;
	/** 'smooth' | 'auto' | 'instant' (default 'smooth') */
	behavior?: ScrollBehavior;
	/** Permite desactivarlo dinámicamente (p. ej. con un modal abierto) */
	enabled?: boolean;
	/** 'window': escucha en todo el documento. 'element': solo si el nodo tiene foco */
	scope?: 'window' | 'element';
}

const defaults: Required<ArrowScrollOptions> = {
	step: 40,
	behavior: 'auto',
	enabled: true,
	scope: 'window'
};

function isTyping(target: EventTarget | null) {
	const el = target as HTMLElement | null;
	if (!el) return false;
	return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

function canScroll(node: HTMLElement, axis: 'x' | 'y') {
	const style = getComputedStyle(node);
	const overflow = axis === 'x' ? style.overflowX : style.overflowY;
	const scrollable = overflow === 'auto' || overflow === 'scroll';
	return axis === 'x'
		? scrollable && node.scrollWidth > node.clientWidth
		: scrollable && node.scrollHeight > node.clientHeight;
}

export const arrowScroll: Action<HTMLElement, ArrowScrollOptions | undefined> = (
	node,
	options
) => {
	let opts = { ...defaults, ...options };
	let target: Window | HTMLElement | null = null;

	function onKeydown(e: KeyboardEvent) {
		if (!opts.enabled || e.defaultPrevented) return;
		if (e.altKey || e.ctrlKey || e.metaKey) return;
		if (isTyping(e.target)) return;

		let dx = 0;
		let dy = 0;
		switch (e.key) {
			case 'ArrowLeft': dx = -1; break;
			case 'ArrowRight': dx = 1; break;
			case 'ArrowUp': dy = -1; break;
			case 'ArrowDown': dy = 1; break;
			default: return;
		}

		// Solo intercepta si ese eje realmente hace scroll
		if ((dx && !canScroll(node, 'x')) || (dy && !canScroll(node, 'y'))) return;

		e.preventDefault();
		node.scrollBy({
			left: dx * opts.step,
			top: dy * opts.step,
			behavior: opts.behavior
		});
	}

	function attach() {
		target?.removeEventListener('keydown', onKeydown as EventListener);
		if (opts.scope === 'element') {
			if (!node.hasAttribute('tabindex')) node.tabIndex = 0; // para poder tener foco
			target = node;
		} else {
			target = window;
		}
		target.addEventListener('keydown', onKeydown as EventListener);
	}

	attach();

	return {
		update(newOptions) {
			const prevScope = opts.scope;
			opts = { ...defaults, ...newOptions };
			if (opts.scope !== prevScope) attach();
		},
		destroy() {
			target?.removeEventListener('keydown', onKeydown as EventListener);
		}
	};
};