// lib/util/filtro.ts
import { StoreAgrupaciones } from '$lib/stores/StoreAgrupaciones.svelte';
import { filtroStore } from '$lib/stores/filtroStore.svelte';
import { selectedGroupStore } from '$lib/stores/groupFilter.svelte';
import { formatDateFull, parseDateTimeLocal } from './agenda';

export const getNestedValue = (obj: any, path: string): any => {
	return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

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

export function filtrarDatos<T>(
	items: T[],
	agenteId: string,
	searchFilters: { action: string; column: { key: string }; value?: string }[]
): T[] {
	let result =
		agenteId !== '' ? items.filter((item: any) => String(item.id_agente) === agenteId) : [...items];

	if (searchFilters.length === 0) return result;

	return result.filter((item) =>
		searchFilters.every((f) => {
			const val = getNestedValue(item, f.column.key);

			switch (f.action) {
				case 'contains':
					return String(val || '')
						.toLowerCase()
						.includes(String(f.value || '').toLowerCase());
				case 'isNull':
					return (
						val == null ||
						val === '' ||
						val === 0 ||
						val === '0' ||
						(Array.isArray(val) && val.length === 0)
					);
				case 'hasData':
					if (Array.isArray(val)) return val.length > 0;
					return val != null && val !== '' && val !== 0 && val !== '0';
				case 'gte':
					return !isNaN(Number(val)) && !isNaN(Number(f.value)) && Number(val) >= Number(f.value);
				case 'gt':
					return !isNaN(Number(val)) && !isNaN(Number(f.value)) && Number(val) > Number(f.value);
				case 'lte':
					return !isNaN(Number(val)) && !isNaN(Number(f.value)) && Number(val) <= Number(f.value);
				case 'lt':
					return !isNaN(Number(val)) && !isNaN(Number(f.value)) && Number(val) < Number(f.value);
				case 'dateGte': {
					if (!val || !f.value) return false;
					const itemTime = Date.parse(String(val));
					const filterTime = Date.parse(String(f.value));
					return !isNaN(itemTime) && !isNaN(filterTime) && itemTime >= filterTime;
				}
				case 'dateLte': {
					if (!val || !f.value) return false;
					const itemTime = Date.parse(String(val));
					const filterTime = Date.parse(`${f.value}T23:59:59.999Z`);
					return !isNaN(itemTime) && !isNaN(filterTime) && itemTime <= filterTime;
				}
				default:
					return true;
			}
		})
	);
}

export function agruparDatos<T>(
	items: T[],
	campo: string,
	valorPorDefecto: string = 'Sin agrupar'
): { grupo: string; elementos: T[] }[] {
	if (!campo) return [{ grupo: valorPorDefecto, elementos: items }];
	const grupos = new Map<string, T[]>();
	for (const item of items) {
		const valor = (item as any)[campo];
		const nombreGrupo = ['inicio', 'fecha_creacion', 'fecha_cierre'].includes(campo as string)
			? valor
				? String(formatDateFull(parseDateTimeLocal(valor)))
				: valorPorDefecto
			: valor
				? String(valor)
				: valorPorDefecto;

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

export function procesarDatosReactivos(actividades: any[], currentRoute: string) {
	const datosOrdenados = obtenerDatosFiltrados(actividades, currentRoute);
	return agruparDatosPorRuta(datosOrdenados, currentRoute);
}

/**
 * Filtra y ordena las actividades según las reglas de la ruta actual.
 * No agrupa nada, devuelve la lista "plana" lista para usarse o para agrupar.
 */
export function obtenerDatosFiltrados(actividades: any[], currentRoute: string) {
	if (!actividades || !Array.isArray(actividades)) return [];

	const activeFilters = filtroStore.filtersByRoute[currentRoute] || [];
	// Adición de acciones para fechas
	const FILTER_ACTIONS = [
		'contains',
		'isNull',
		'hasData',
		'gte',
		'gt',
		'lte',
		'lt',
		'dateGte',
		'dateLte'
	];
	const searchFilters = activeFilters.filter((f) => FILTER_ACTIONS.includes(f.action));
	const sortFilters = activeFilters.filter((f) => !FILTER_ACTIONS.includes(f.action));

	const agenteId = selectedGroupStore.selectedAgent ?? '';

	const filtrados = filtrarDatos(actividades, agenteId, searchFilters);
	return ordenarDatos(filtrados, sortFilters);
}

/**
 * Agrupa una lista ya filtrada/ordenada según las reglas de agrupación
 * configuradas para esa ruta.
 */
export function agruparDatosPorRuta(datos: any[], currentRoute: string) {
	if (!datos || !Array.isArray(datos)) return [];

	const reglasAgrupacion = StoreAgrupaciones.filtersByRoute[currentRoute];
	return agruparDatos(datos, reglasAgrupacion);
}
