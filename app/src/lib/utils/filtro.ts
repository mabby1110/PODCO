import { globalFilterStore } from '$lib/stores/globalFilterStore.svelte';
import { selectedGroupStore } from '$lib/stores/groupFilter.svelte';

export const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export function filtrarDatos<T>(
    items: T[],
    agenteId: string,
    searchFilters: { action: string; column: { key: string }; value: string }[]
): T[] {
    let result = agenteId !== ''
        ? items.filter((item: any) => String(item.id_agente) === agenteId)
        : [...items];

    if (searchFilters.length > 0) {
        result = result.filter(item =>
            searchFilters.every(f => {
                const val = getNestedValue(item, f.column.key);
                return String(val || '').toLowerCase().includes(f.value.toLowerCase());
            })
        );
    }

    return result;
}

export function ordenarDatos<T>(
    items: T[],
    sortFilters: { action: string; column: { key: string } }[]
): T[] {
    if (sortFilters.length === 0) return items;

    return [...items].sort((a, b) => {
        for (const f of sortFilters) {
            const valA = getNestedValue(a, f.column.key) || '';
            const valB = getNestedValue(b, f.column.key) || '';
            if (valA < valB) return f.action === 'asc' ? -1 : 1;
            if (valA > valB) return f.action === 'asc' ? 1 : -1;
        }
        return 0;
    });
}

export function agruparDatos<T>(
    items: T[],
    campo: keyof T | string,
    valorPorDefecto: string = 'Sin agrupar'
): { grupo: string; elementos: T[] }[] {
    if (!campo) return [{ grupo: valorPorDefecto, elementos: items }];

    const grupos = new Map<string, T[]>();

    for (const item of items) {
        const valor = (item as any)[campo];
        const nombreGrupo = valor ? String(valor) : valorPorDefecto;

        if (!grupos.has(nombreGrupo)) {
            grupos.set(nombreGrupo, []);
        }
        grupos.get(nombreGrupo)!.push(item);
    }

    return Array.from(grupos.entries()).map(([grupo, elementos]) => ({
        grupo,
        elementos
    }));
}

export function procesarDatosReactivos(actividades: any[]) {
    if (!actividades || !Array.isArray(actividades)) return [];

    const activeFilters = globalFilterStore.activeFilters || [];
    const searchFilters = activeFilters.filter(f => f.action === 'contains');
    const sortFilters = activeFilters.filter(f => f.action !== 'contains');
    
    const agenteId = selectedGroupStore.selectedAgent ?? '';
    const grupoSeleccionado = selectedGroupStore.selectedGroup ?? '';

    const filtrados = filtrarDatos(actividades, agenteId, searchFilters);
    const ordenados = ordenarDatos(filtrados, sortFilters);
    
    return agruparDatos(ordenados, grupoSeleccionado);
}