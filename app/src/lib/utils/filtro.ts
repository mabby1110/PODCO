// lib/util/filtro.ts
import { filtroStore } from '$lib/stores/filtroStore.svelte';
import { selectedGroupStore } from '$lib/stores/groupFilter.svelte';
import { formatDateFull, parseDateTimeLocal } from './agenda';

export const getNestedValue = (obj: any, path: string): any => {
	return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

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
				default:
					return true;
			}
		})
	);
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
	console.log(grupos)
	for (const item of items) {
		const valor = (item as any)[campo];
		const nombreGrupo =
			['inicio', 'fecha_creacion', 'fecha_cierre'].includes(campo as string)
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
	if (!actividades || !Array.isArray(actividades)) return [];

	const activeFilters = filtroStore.filtersByRoute[currentRoute] || [];
	const FILTER_ACTIONS = ['contains', 'isNull', 'hasData'];
	const searchFilters = activeFilters.filter((f) => FILTER_ACTIONS.includes(f.action));
	const sortFilters = activeFilters.filter((f) => !FILTER_ACTIONS.includes(f.action));

	const agenteId = selectedGroupStore.selectedAgent ?? '';
	const grupoSeleccionado = selectedGroupStore.selectedGroup ?? '';

	const filtrados = filtrarDatos(actividades, agenteId, searchFilters);
	const ordenados = ordenarDatos(filtrados, sortFilters);

	return agruparDatos(ordenados, grupoSeleccionado);
}
