import { globalFilterStore } from '$lib/stores/globalFilterStore.svelte';
import { selectedGroupStore } from '$lib/stores/groupFilter.svelte';

/**
 * Agrupa una lista de objetos por una propiedad específica.
 * @param items El array de elementos genéricos.
 * @param campo El nombre de la propiedad por la cual agrupar.
 * @param valorPorDefecto String a mostrar cuando el campo es null o undefined.
 */
export function agruparPor<T>(
    items: T[],
    campo: keyof T,
    valorPorDefecto: string = 'Sin agrupar'
): { grupo: string; elementos: T[] }[] {
    const grupos = new Map<string, T[]>();

    for (const item of items) {
        const valor = item[campo];
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

/**
 * Procesa una lista de items aplicando:
 * 1. Filtro por agente (Store)
 * 2. Filtros globales y búsqueda (Store)
 * 3. Ordenamiento (Store)
 * 4. Agrupación (Store)
 */
export function procesarDatosReactivos(actividades: any) {
    if (!actividades) return [];

    const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    // 1. Filtro por Agente
    let result = selectedGroupStore.selectedAgent !== ''
        ? actividades.filter((item: any) => String(item.id_agente) === selectedGroupStore.selectedAgent)
        : [...actividades];

    // 2. Filtros Globales (Búsqueda)
    const activeFilters = globalFilterStore.activeFilters;
    const searchFilters = activeFilters.filter(f => f.action === 'contains');
    
    if (searchFilters.length > 0) {
        result = result.filter(item => 
            searchFilters.every(f => {
                const val = getNestedValue(item, f.column.key);
                return String(val || '').toLowerCase().includes(f.value);
            })
        );
    }

    // 3. Ordenamiento
    const sortFilters = activeFilters.filter(f => f.action !== 'contains');
    if (sortFilters.length > 0) {
        result.sort((a, b) => {
            for (const f of sortFilters) {
                const valA = getNestedValue(a, f.column.key) || '';
                const valB = getNestedValue(b, f.column.key) || '';
                if (valA < valB) return f.action === 'asc' ? -1 : 1;
                if (valA > valB) return f.action === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    // 4. Agrupación
    const grupoSeleccionado = selectedGroupStore.selectedGroup ?? '';
    return agruparPor(result, grupoSeleccionado);
}