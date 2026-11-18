import { get } from 'svelte/store';
import { appState } from '$lib/stores/appState.svelte';

export interface DragData<T = unknown> {
	type: string;
	payload: T;
	source?: string;
}

export interface DraggableOptions<T = unknown> {
	data: DragData<T>;
	enabled?: boolean;
}

export interface DropzoneOptions {
	accept?: string[];
	enabled?: boolean;
	dropEffect?: 'move' | 'copy' | 'link';
	dragoverClass?: string;

	onDrop?: (data: DragData, event: DragEvent | CustomEvent) => void;
}
// =====================================================
// DRAGGABLE
// =====================================================

export function draggable(node: HTMLElement, options: DraggableOptions | DragData | any) {
	let state: DraggableOptions = normalizeOptions(options);

	let isDragging = false;
	let ghostElement: HTMLElement | null = null;
	let currentDropzone: HTMLElement | null = null;

	function normalizeOptions(options: any): DraggableOptions {
		if (options && typeof options === 'object' && 'data' in options && 'enabled' in options) {
			return options;
		}

		if (options && typeof options === 'object' && 'type' in options && 'payload' in options) {
			return {
				data: options,
				enabled: true
			};
		}

		return {
			data: {
				type: 'default',
				payload: options
			},
			enabled: true
		};
	}

	function isDndEnabled() {
		return true;
	}

	function canDrag() {
		return state.enabled !== false && isDndEnabled();
	}

	function updateDraggable() {
		node.draggable = canDrag();
		node.style.cursor = canDrag() ? 'grab' : 'pointer';
	}

	function serializeData(): string {
		return JSON.stringify(state.data);
	}

	// =================================================
	// DESKTOP
	// =================================================

	function handle_dragstart(e: DragEvent) {
		if (!canDrag()) {
			e.preventDefault();
			return;
		}

		if (e.dataTransfer) {
			e.dataTransfer.setData('application/json', serializeData());

			e.dataTransfer.effectAllowed = 'move';
		}

		node.style.cursor = 'grabbing';
	}

	function handle_dragend() {
		node.style.cursor = canDrag() ? 'grab' : 'pointer';
	}

	// =================================================
	// MOBILE / TOUCH
	// =================================================

	function handle_touchstart(e: TouchEvent) {
		if (!canDrag()) return;

		if (e.touches.length !== 1) return;

		const touch = e.touches[0];

		isDragging = true;

		ghostElement = node.cloneNode(true) as HTMLElement;

		ghostElement.style.position = 'fixed';
		ghostElement.style.pointerEvents = 'none';
		ghostElement.style.opacity = '0.5';
		ghostElement.style.zIndex = '10000';
		ghostElement.style.left = `${touch.clientX}px`;
		ghostElement.style.top = `${touch.clientY}px`;
		ghostElement.style.transform = 'translate(-50%, -50%)';
		ghostElement.style.width = `${node.offsetWidth}px`;
		ghostElement.style.margin = '0';

		document.body.appendChild(ghostElement);

		node.style.opacity = '0.4';
		node.style.cursor = 'grabbing';
	}

	function handle_touchmove(e: TouchEvent) {
		if (!isDragging || !ghostElement) return;

		e.preventDefault();

		const touch = e.touches[0];

		ghostElement.style.left = `${touch.clientX}px`;
		ghostElement.style.top = `${touch.clientY}px`;

		const elementsBelow = document.elementsFromPoint(touch.clientX, touch.clientY);

		const dropzoneBelow = elementsBelow.find(
			(el) => el instanceof HTMLElement && el.hasAttribute('data-dropzone') && el !== node
		) as HTMLElement | undefined;

		if (dropzoneBelow !== currentDropzone) {
			if (currentDropzone) {
				const oldClass = currentDropzone.getAttribute('data-dragover-class') || 'droppable';

				currentDropzone.classList.remove(oldClass);
			}

			if (dropzoneBelow) {
				const newClass = dropzoneBelow.getAttribute('data-dragover-class') || 'droppable';

				dropzoneBelow.classList.add(newClass);
			}

			currentDropzone = dropzoneBelow || null;
		}
	}

	function cleanupTouch() {
		isDragging = false;

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
		node.style.cursor = canDrag() ? 'grab' : 'pointer';
	}

	function handle_touchend(e: TouchEvent) {
		if (!isDragging) return;

		const touch = e.changedTouches[0];

		const elementsBelow = document.elementsFromPoint(touch.clientX, touch.clientY);

		const dropzoneBelow = elementsBelow.find(
			(el) => el instanceof HTMLElement && el.hasAttribute('data-dropzone') && el !== node
		) as HTMLElement | undefined;

		if (dropzoneBelow) {
			const customEvent = new CustomEvent('touchdrop', {
				bubbles: false,
				detail: {
					data: state.data,
					touch
				}
			});

			dropzoneBelow.dispatchEvent(customEvent);
		}

		cleanupTouch();
	}

	function handle_touchcancel() {
		cleanupTouch();
	}

	// =================================================
	// LISTENERS
	// =================================================

	updateDraggable();

	node.addEventListener('dragstart', handle_dragstart);
	node.addEventListener('dragend', handle_dragend);

	node.addEventListener('touchstart', handle_touchstart, {
		passive: true
	});

	node.addEventListener('touchmove', handle_touchmove, {
		passive: false
	});

	node.addEventListener('touchend', handle_touchend);
	node.addEventListener('touchcancel', handle_touchcancel);

	return {
		update(newOptions: DraggableOptions | DragData | any) {
			state = normalizeOptions(newOptions);
			updateDraggable();
		},

		destroy() {
			node.removeEventListener('dragstart', handle_dragstart);
			node.removeEventListener('dragend', handle_dragend);

			node.removeEventListener('touchstart', handle_touchstart);
			node.removeEventListener('touchmove', handle_touchmove);
			node.removeEventListener('touchend', handle_touchend);
			node.removeEventListener('touchcancel', handle_touchcancel);

			cleanupTouch();

			node.draggable = false;
			node.style.cursor = '';
			node.style.opacity = '';
		}
	};
}

// =====================================================
// DROPZONE
// =====================================================

export function dropzone(node: HTMLElement, options: DropzoneOptions = {}) {
	let state: DropzoneOptions = normalizeDropzoneOptions(options);

	function normalizeDropzoneOptions(options: DropzoneOptions): DropzoneOptions {
		return {
			enabled: true,
			accept: ['*'],
			dropEffect: 'move',
			dragoverClass: 'droppable',
			...options
		};
	}

	function isDndEnabled() {
		return get(appState).dnd;
	}

	function isEnabled() {
		return state.enabled !== false && isDndEnabled();
	}

	function isValid(data: DragData): boolean {
		if (!isEnabled()) return false;

		if (!data || typeof data.type !== 'string') {
			return false;
		}

		if (state.accept?.includes('*')) {
			return true;
		}

		return state.accept?.includes(data.type) ?? false;
	}

	function updateAttributes() {
		node.setAttribute('data-dropzone', 'true');

		node.setAttribute('data-dragover-class', state.dragoverClass || 'droppable');
	}

	function removeDragoverClass() {
		node.classList.remove(state.dragoverClass || 'droppable');
	}

	function handleDrop(data: DragData, event: DragEvent | CustomEvent) {
		if (!isValid(data)) {
			removeDragoverClass();
			return;
		}

		state.onDrop?.(data, event);

		removeDragoverClass();
	}

	// =================================================
	// DESKTOP
	// =================================================

	function handle_dragenter(e: DragEvent) {
		if (!isEnabled()) return;

		e.preventDefault();

		node.classList.add(state.dragoverClass || 'droppable');
	}

	function handle_dragleave(e: DragEvent) {
		if (!isEnabled()) return;

		const related = e.relatedTarget;

		if (related instanceof Node && node.contains(related)) {
			return;
		}

		removeDragoverClass();
	}

	function handle_dragover(e: DragEvent) {
		if (!isEnabled()) return;

		e.preventDefault();

		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = state.dropEffect || 'move';
		}
	}

	function handle_drop(e: DragEvent) {
		if (!isEnabled()) return;

		e.preventDefault();
		e.stopPropagation();

		const rawData = e.dataTransfer?.getData('application/json');

		removeDragoverClass();

		if (!rawData) return;

		try {
			const data = JSON.parse(rawData) as DragData;

			handleDrop(data, e);
		} catch {
			console.warn('Drag & Drop: datos JSON inválidos');
		}
	}

	// =================================================
	// MOBILE / TOUCH
	// =================================================

	function handle_touchdrop(e: Event) {
		if (!isEnabled()) return;

		const event = e as CustomEvent<{
			data: DragData;
			touch: Touch;
		}>;

		if (!event.detail?.data) return;

		handleDrop(event.detail.data, event);
	}

	// =================================================
	// LISTENERS
	// =================================================

	updateAttributes();

	node.addEventListener('dragenter', handle_dragenter);
	node.addEventListener('dragleave', handle_dragleave);
	node.addEventListener('dragover', handle_dragover);
	node.addEventListener('drop', handle_drop);
	node.addEventListener('touchdrop', handle_touchdrop);

	return {
		update(newOptions: DropzoneOptions = {}) {
			state = normalizeDropzoneOptions(newOptions);
			updateAttributes();
			removeDragoverClass();
		},

		destroy() {
			node.removeEventListener('dragenter', handle_dragenter);
			node.removeEventListener('dragleave', handle_dragleave);
			node.removeEventListener('dragover', handle_dragover);
			node.removeEventListener('drop', handle_drop);
			node.removeEventListener('touchdrop', handle_touchdrop);

			removeDragoverClass();

			node.removeAttribute('data-dropzone');
			node.removeAttribute('data-dragover-class');
		}
	};
}
