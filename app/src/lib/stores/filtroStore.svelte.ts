import { browser } from '$app/environment';
import { getCookie, setCookie } from '$lib/utils/cookies';

export type FilterAction = 'asc' | 'desc' | 'contains';

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

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function getInitialFilters(): RouteFilters {
    if (!browser) return {};
    const saved = getCookie('activeFilters');
    if (saved) {
        try {
            return JSON.parse(decodeURIComponent(saved));
        } catch (e) {
            console.error("Error parseando los filtros de las cookies", e);
            return {};
        }
    }
    return {};
}

function saveFiltersToCookie(filters: RouteFilters) {
    if (!browser) return;
    setCookie('activeFilters', encodeURIComponent(JSON.stringify(filters)), { maxAge: COOKIE_MAX_AGE });
}

function getInitialMaxId(filters: RouteFilters): number {
    let max = 0;
    for (const route in filters) {
        for (const f of filters[route]) {
            if (f.id > max) max = f.id;
        }
    }
    return max;
}

const initialFilters = getInitialFilters();

export const filtroStore = $state({
    filtersByRoute: initialFilters,
    filterIdCounter: getInitialMaxId(initialFilters) + 1,
    
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
    },
    
    removeFilter(route: string, id: number) {
        if (!this.filtersByRoute[route]) return;
        this.filtersByRoute[route] = this.filtersByRoute[route].filter((f) => f.id !== id);
    },

    clearFilters(route: string) {
        this.filtersByRoute[route] = [];
    },

    clearAllFilters() {
        this.filtersByRoute = {};
    }
});

$effect.root(() => {
    $effect(() => saveFiltersToCookie(filtroStore.filtersByRoute));
});