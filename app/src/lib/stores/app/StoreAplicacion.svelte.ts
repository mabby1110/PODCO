// src/lib/stores/app/StoreAplicacion.svelte.ts
import { browser } from '$app/environment';
import { getCookieJSON, setCookieJSON } from '$lib/utils/cookies';

export interface AppState {
	controles: boolean;
	retraer: boolean;
	leyenda: boolean;
	modal_editar_pedido: boolean;
}

const COOKIE_NAME = 'appState';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

const defaultState: AppState = {
	controles: false,
	retraer: false,
	leyenda: false,
	modal_editar_pedido: false
};

function getInitialState(): AppState {
	if (!browser) return { ...defaultState };
	// Mezclamos con el default por si la cookie guardada es antigua y le faltan claves
	return { ...defaultState, ...(getCookieJSON<Partial<AppState>>(COOKIE_NAME) ?? {}) };
}

class EstadoAplicacion {
	#state = $state<AppState>(getInitialState());

	constructor() {
		if (browser) {
			// Guarda la cookie automáticamente ante cualquier cambio,
			// incluso si se modifica con bind: desde un componente.
			$effect.root(() => {
				$effect(() => {
					setCookieJSON(COOKIE_NAME, $state.snapshot(this.#state), {
						maxAge: COOKIE_MAX_AGE
					});
				});
			});
		}
	}

	// Se usa en los componentes: StoreAplicacion.value.leyenda
	get value() {
		return this.#state;
	}

	toggle(key: keyof AppState) {
		this.#state[key] = !this.#state[key];
	}

	set(key: keyof AppState, valor: boolean) {
		this.#state[key] = valor;
	}

	reset() {
		Object.assign(this.#state, defaultState);
	}
}

export const StoreAplicacion = new EstadoAplicacion();