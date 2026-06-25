// src/lib/stores/filtroStore.svelte.ts
import { browser } from '$app/environment';
import { getCookieJSON, setCookieJSON } from '$lib/utils/cookies';

export type ActiveFilter = {
	agrupacion: string;
};

export type RouteFilters = Record<string, ActiveFilter[]>;

const COOKIE_NAME = 'agrupaciones';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

class FiltroStore {
	filtersByRoute = $state<RouteFilters>({});

	constructor() {
		if (browser) {
			const saved = getCookieJSON<RouteFilters>(COOKIE_NAME);
			if (saved) {
				this.filtersByRoute = saved;
			}

			// Aísla la escritura de la cookie exclusivamente en el ciclo del cliente
			$effect.root(() => {
				$effect(() => {
					setCookieJSON(COOKIE_NAME, this.filtersByRoute, { maxAge: COOKIE_MAX_AGE, path: '/' });
				});
			});
		}
	}

	add(route: string, agrupacion: string) {
		if (!this.filtersByRoute[route]) {
			this.filtersByRoute[route] = [];
		}

		this.filtersByRoute[route].push({ agrupacion });
	}

	clearAll() {
		this.filtersByRoute = {};
	}
}

export const agrupacionesStore = new FiltroStore();
