// src/lib/stores/filtroStore.svelte.ts
import { browser } from '$app/environment';
import { getCookieJSON, setCookieJSON } from '$lib/utils/cookies';

export type FilterAction = 'asc' | 'desc' | 'contains' | 'isNull' | 'hasData';

export type ColumnDef = {
    key: string;
    label: string;
};

export type ActiveFilter = {
    id: number;
    column: ColumnDef;
    action: FilterAction;
    value: string;
};

export type RouteFilters = Record<string, ActiveFilter[]>;

const COOKIE_NAME = 'activeFilters';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

class FiltroStore {
    filtersByRoute = $state<RouteFilters>({});
    filterIdCounter = $state<number>(1);

    constructor() {
        if (browser) {
            const saved = getCookieJSON<RouteFilters>(COOKIE_NAME);
            if (saved) {
                this.filtersByRoute = saved;
                this.filterIdCounter = this.getInitialMaxId(saved) + 1;
            }

            // Aísla la escritura de la cookie exclusivamente en el ciclo del cliente
            $effect.root(() => {
                $effect(() => {
                    setCookieJSON(COOKIE_NAME, this.filtersByRoute, { maxAge: COOKIE_MAX_AGE, path: '/' });
                });
            });
        }
    }

    private getInitialMaxId(filters: RouteFilters): number {
        let max = 0;
        for (const route in filters) {
            for (const f of filters[route]) {
                if (f.id > max) max = f.id;
            }
        }
        return max;
    }

    addFilter(route: string, column: ColumnDef, action: FilterAction, value: string) {
        if (!this.filtersByRoute[route]) {
            this.filtersByRoute[route] = [];
        }
        
        this.filtersByRoute[route].push({
            id: this.filterIdCounter++,
            column,
            action,
            value
        });
    }

    removeFilter(route: string, id: number) {
        if (!this.filtersByRoute[route]) return;
        this.filtersByRoute[route] = this.filtersByRoute[route].filter((f) => f.id !== id);
    }

    clearFilters(route: string) {
        this.filtersByRoute[route] = [];
    }

    clearAllFilters() {
        this.filtersByRoute = {};
    }
}

export const filtroStore = new FiltroStore();