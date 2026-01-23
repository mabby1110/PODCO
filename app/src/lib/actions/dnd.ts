import { get } from 'svelte/store';
import { appState } from '$lib/stores/appState.svelte';

// Tipos para mejor tipado
interface DraggableOptions {
	data: any;
	enabled?: boolean;
}

interface DropzoneOptions {
	dropEffect?: 'move' | 'copy' | 'link';
	dragoverClass?: string;
	enabled?: boolean;
	on_dropzone?: (data: any, e: DragEvent | TouchEvent) => void;
}

// Utilidad para detectar si un elemento está sobre otro
function isElementOver(x: number, y: number, element: HTMLElement): boolean {
	const rect = element.getBoundingClientRect();
	return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

export function draggable(node: HTMLElement, options: DraggableOptions | any) {
	let state =
		typeof options === 'object' && 'enabled' in options
			? options
			: { data: options, enabled: true };

	let isDragging = false;
	let ghostElement: HTMLElement | null = null;
	let startX = 0;
	let startY = 0;
	let currentDropzone: HTMLElement | null = null;

	function updateDraggable() {
		const isDndEnabled = get(appState).dnd;
		const enabled = state.enabled && isDndEnabled;

		node.draggable = enabled;
		node.style.cursor = enabled ? 'grab' : 'default';
	}

	updateDraggable();

	// ===== DRAG & DROP (Desktop) =====
	function handle_dragstart(e: DragEvent) {
		const isDndEnabled = get(appState).dnd;
		if (!state.enabled || !isDndEnabled) {
			e.preventDefault();
			return;
		}
		if (e.dataTransfer) {
			e.dataTransfer.setData('text/plain', state.data);
			e.dataTransfer.effectAllowed = 'move';
		}
		node.style.cursor = 'grabbing';
	}

	function handle_dragend() {
		node.style.cursor = 'grab';
	}

	// ===== TOUCH (Mobile/Tablet) =====
	function handle_touchstart(e: TouchEvent) {
		const isDndEnabled = get(appState).dnd;
		if (!state.enabled || !isDndEnabled) return;

		isDragging = true;
		const touch = e.touches[0];
		startX = touch.clientX;
		startY = touch.clientY;

		// Crear elemento fantasma para arrastrar
		ghostElement = node.cloneNode(true) as HTMLElement;
		ghostElement.style.position = 'fixed';
		ghostElement.style.pointerEvents = 'none';
		ghostElement.style.opacity = '0.5';
		ghostElement.style.zIndex = '10000';
		ghostElement.style.left = `${touch.clientX}px`;
		ghostElement.style.top = `${touch.clientY}px`;
		ghostElement.style.transform = 'translate(-50%, -50%)';
		ghostElement.style.width = `${node.offsetWidth}px`;

		document.body.appendChild(ghostElement);

		// Feedback visual en el elemento original
		node.style.opacity = '0.4';
		node.style.cursor = 'grabbing';
	}

	function handle_touchmove(e: TouchEvent) {
		if (!isDragging || !ghostElement) return;

		e.preventDefault(); // Prevenir scroll mientras se arrastra

		const touch = e.touches[0];
		ghostElement.style.left = `${touch.clientX}px`;
		ghostElement.style.top = `${touch.clientY}px`;

		// Detectar dropzone debajo del dedo
		const elementsBelow = document.elementsFromPoint(touch.clientX, touch.clientY);
		const dropzoneBelow = elementsBelow.find(
			(el) => el.hasAttribute('data-dropzone') && el !== node
		) as HTMLElement | undefined;

		// Actualizar clase de dropzone
		if (dropzoneBelow !== currentDropzone) {
			if (currentDropzone) {
				const dragoverClass = currentDropzone.getAttribute('data-dragover-class') || 'droppable';
				currentDropzone.classList.remove(dragoverClass);
			}
			if (dropzoneBelow) {
				const dragoverClass = dropzoneBelow.getAttribute('data-dragover-class') || 'droppable';
				dropzoneBelow.classList.add(dragoverClass);
			}
			currentDropzone = dropzoneBelow || null;
		}
	}

	function handle_touchend(e: TouchEvent) {
		if (!isDragging) return;

		isDragging = false;

		const touch = e.changedTouches[0];
		const elementsBelow = document.elementsFromPoint(touch.clientX, touch.clientY);
		const dropzoneBelow = elementsBelow.find(
			(el) => el.hasAttribute('data-dropzone') && el !== node
		) as HTMLElement | undefined;

		// Disparar evento de drop si hay dropzone
		if (dropzoneBelow) {
			const customEvent = new CustomEvent('touchdrop', {
				detail: { data: state.data, touch }
			});
			dropzoneBelow.dispatchEvent(customEvent);

			const dragoverClass = dropzoneBelow.getAttribute('data-dragover-class') || 'droppable';
			dropzoneBelow.classList.remove(dragoverClass);
		}

		// Limpiar
		if (ghostElement) {
			ghostElement.remove();
			ghostElement = null;
		}
		if (currentDropzone) {
			const dragoverClass = currentDropzone.getAttribute('data-dragover-class') || 'droppable';
			currentDropzone.classList.remove(dragoverClass);
			currentDropzone = null;
		}

		node.style.opacity = '1';
		node.style.cursor = 'grab';
	}

	// Agregar event listeners
	node.addEventListener('dragstart', handle_dragstart);
	node.addEventListener('dragend', handle_dragend);
	node.addEventListener('touchstart', handle_touchstart, { passive: false });
	node.addEventListener('touchmove', handle_touchmove, { passive: false });
	node.addEventListener('touchend', handle_touchend);
	node.addEventListener('touchcancel', handle_touchend);

	return {
		update(newOptions: DraggableOptions | any) {
			state =
				typeof newOptions === 'object' && 'enabled' in newOptions
					? newOptions
					: { data: newOptions, enabled: true };
			updateDraggable();
		},
		destroy() {
			node.removeEventListener('dragstart', handle_dragstart);
			node.removeEventListener('dragend', handle_dragend);
			node.removeEventListener('touchstart', handle_touchstart);
			node.removeEventListener('touchmove', handle_touchmove);
			node.removeEventListener('touchend', handle_touchend);
			node.removeEventListener('touchcancel', handle_touchend);

			if (ghostElement) {
				ghostElement.remove();
			}
		}
	};
}

export function dropzone(node: HTMLElement, options: DropzoneOptions = {}) {
	let state: DropzoneOptions = {
		dropEffect: 'move',
		dragoverClass: 'droppable',
		enabled: true,
		...options
	};

	// Marcar el nodo como dropzone para detección táctil
	node.setAttribute('data-dropzone', 'true');
	node.setAttribute('data-dragover-class', state.dragoverClass || 'droppable');

	// ===== DRAG & DROP (Desktop) =====
	function handle_dragenter(e: DragEvent) {
		const isDndEnabled = get(appState).dnd;
		if (!state.enabled || !isDndEnabled) return;
		node.classList.add(state.dragoverClass!);
	}

	function handle_dragleave(e: DragEvent) {
		const isDndEnabled = get(appState).dnd;
		if (!state.enabled || !isDndEnabled) return;
		node.classList.remove(state.dragoverClass!);
	}

	function handle_drop(e: DragEvent) {
		const isDndEnabled = get(appState).dnd;
		if (!state.enabled || !isDndEnabled) return;

		e.preventDefault();

		const data = e.dataTransfer?.getData('text/plain');
		node.classList.remove(state.dragoverClass!);

		if (state.on_dropzone && data) {
			state.on_dropzone(data, e);
		}
	}

	function handle_dragover(e: DragEvent) {
		const isDndEnabled = get(appState).dnd;
		if (!state.enabled || !isDndEnabled) return;
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = state.dropEffect!;
		}
	}
	
	// ===== TOUCH (Mobile/Tablet) =====
	function handle_touchdrop(e: CustomEvent) {
		const isDndEnabled = get(appState).dnd;
		if (!state.enabled || !isDndEnabled) return;

		if (state.on_dropzone && e.detail.data) {
			state.on_dropzone(e.detail.data, e);
		}
	}

	// Agregar event listeners
	node.addEventListener('dragenter', handle_dragenter);
	node.addEventListener('dragleave', handle_dragleave);
	node.addEventListener('dragover', handle_dragover);
	node.addEventListener('drop', handle_drop);
	node.addEventListener('touchdrop', handle_touchdrop as EventListener);

	return {
		update(newOptions: DropzoneOptions = {}) {
			state = {
				dropEffect: 'move',
				dragoverClass: 'droppable',
				enabled: true,
				...newOptions
			};
			node.setAttribute('data-dragover-class', state.dragoverClass || 'droppable');
		},
		destroy() {
			node.removeEventListener('dragenter', handle_dragenter);
			node.removeEventListener('dragleave', handle_dragleave);
			node.removeEventListener('dragover', handle_dragover);
			node.removeEventListener('drop', handle_drop);
			node.removeEventListener('touchdrop', handle_touchdrop as EventListener);
			node.removeAttribute('data-dropzone');
			node.removeAttribute('data-dragover-class');
		}
	};
}
