// src/lib/stores/globalFilterStore.svelte.ts
import { browser } from '$app/environment';
import { getCookie, setCookie } from '$lib/utils/cookies';

// Exportamos los tipos para poder reutilizarlos en los componentes
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

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// Helpers para manejar el Array en cookies
function getInitialFilters(): ActiveFilter[] {
    if (!browser) return [];
    const saved = getCookie('activeFilters');
    if (saved) {
        try {
            return JSON.parse(decodeURIComponent(saved));
        } catch (e) {
            console.error("Error parseando los filtros de las cookies", e);
            return [];
        }
    }
    return [];
}

function saveFiltersToCookie(filters: ActiveFilter[]) {
    if (!browser) return;
    // Usamos encodeURIComponent porque JSON contiene comillas y caracteres especiales
    setCookie('activeFilters', encodeURIComponent(JSON.stringify(filters)), { maxAge: COOKIE_MAX_AGE });
}

// Inicializamos el Store
export const globalFilterStore = $state({
    activeFilters: getInitialFilters(),
    // Mantenemos un contador de ID basado en el último ID guardado para evitar colisiones
    filterIdCounter: getInitialFilters().reduce((max, f) => Math.max(max, f.id), 0) + 1,
    
    // Métodos mutadores directamente en el store para mantener la lógica centralizada
    addFilter(column: ColumnDef, action: FilterAction, value: string) {
        this.activeFilters = [
            ...this.activeFilters,
            {
                id: this.filterIdCounter++,
                column,
                action,
                value
            }
        ];
    },
    
    removeFilter(id: number) {
        this.activeFilters = this.activeFilters.filter((f) => f.id !== id);
    },

    clearFilters() {
        this.activeFilters = [];
    }
});

// Efecto raíz para auto-guardar cuando activeFilters cambie
$effect.root(() => {
    $effect(() => saveFiltersToCookie(globalFilterStore.activeFilters));
});