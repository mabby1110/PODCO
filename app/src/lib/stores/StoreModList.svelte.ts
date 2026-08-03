// $lib/stores/StoreModList.svelte.ts
import { browser } from '$app/environment';

export type Operator = 'eq' | 'neq' | 'gt' | 'lt' | 'contains';

export interface FilterRule {
    field: string;
    operator: Operator;
    value: any;
}

export interface SortRule {
    field: string;
    direction: 'asc' | 'desc';
}

export interface QueryState {
    filters: FilterRule[];
    sorts: SortRule[];
    groupBy: string | null;
}

export class QueryStore {
    #routes = $state<Record<string, QueryState>>({});

    constructor() {
        if (browser) this.#hydrate();
    }

    get(route: string): QueryState {
        return this.#routes[route] ?? { filters: [], sorts: [], groupBy: null };
    }

    update(route: string, state: Partial<QueryState>) {
        this.#routes[route] = { ...this.get(route), ...state };
        this.#persist();
    }

    #hydrate() {
        const match = document.cookie.match(/(?:^|; )modState=([^;]*)/);
        if (match) {
            try {
                this.#routes = JSON.parse(decodeURIComponent(match[1]));
            } catch {
                this.#routes = {};
            }
        }
    }

    #persist() {
        if (!browser) return;
        const payload = encodeURIComponent(JSON.stringify(this.#routes));
        document.cookie = `modState=${payload}; path=/; max-age=31536000; SameSite=Strict`;
    }
}

export const StoreModList = new QueryStore();