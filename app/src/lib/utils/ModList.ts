import { StoreModList } from '$lib/stores/StoreModList.svelte';
export const extraerColumnas = (datos: any[]): { key: string; label: string; type: 'string' | 'number' | 'date' | 'object' }[] => {
    if (!datos?.length) return [];
    
    const item = datos[0]; 
    
    return Object.keys(item)
        .filter(key => !key.startsWith('id_'))
        .map(key => {
            const val = item[key];
            let type: 'string' | 'number' | 'date' | 'object' = 'string';

            if (typeof val === 'number') {
                type = 'number';
            } else if (val instanceof Date || (typeof val === 'string' && !isNaN(Date.parse(val)) && isNaN(Number(val)))) {
                type = 'date';
            } else if (typeof val === 'object' && val !== null) {
                type = 'object';
            }

            return { 
                key, 
                label: key.charAt(0).toUpperCase() + key.slice(1),
                type 
            };
        });
};

// Implementación en el componente
const parseValue = (val: any): number | string => {
	if (val == null) return '';
	if (typeof val === 'number') return val;
	if (val instanceof Date) return val.getTime();

	if (typeof val === 'string') {
		const num = Number(val);
		if (!isNaN(num) && val.trim() !== '') return num;

		const dateNum = Date.parse(val);
		if (!isNaN(dateNum)) return dateNum;

		return val.toLowerCase();
	}

	return String(val).toLowerCase();
};

export function sortData<T extends Record<string, any>>(data: T[], route: string): T[] {
	const sorts = StoreModList.get(route)?.sorts;
	if (!sorts?.length) return data;

	return [...data].sort((a, b) => {
		for (const rule of sorts) {
			if (!rule.field) continue;

			const valA = parseValue(a[rule.field]);
			const valB = parseValue(b[rule.field]);

			if (valA === valB) continue;

			const modifier = rule.direction === 'asc' ? 1 : -1;
			return valA > valB ? modifier : -modifier;
		}
		return 0;
	});
}

export function filterData<T extends Record<string, any>>(data: T[], route: string): T[] {
	const filters = StoreModList.get(route)?.filters;
	if (!filters?.length) return data;

	const activeFilters = filters.filter((f) => f.field && f.value != null && f.value !== '');
	if (!activeFilters.length) return data;

	return data.filter((item) =>
		activeFilters.every((rule) => {
			const rawVal = item[rule.field];
			const parsedVal = parseValue(rawVal);
			const parsedRuleVal = parseValue(rule.value);

			switch (rule.operator) {
				case 'eq':
					return parsedVal === parsedRuleVal;
				case 'neq':
					return parsedVal !== parsedRuleVal;
				case 'gt':
					return parsedVal > parsedRuleVal;
				case 'lt':
					return parsedVal < parsedRuleVal;
				case 'contains':
					return String(rawVal).toLowerCase().includes(String(rule.value).toLowerCase());
				default:
					return false;
			}
		})
	);
}

export function groupData<T extends Record<string, any>>(
    data: T[],
    route: string
): Array<{ columna: string; items: T[] }> {
    const groupBy = StoreModList.get(route)?.groupBy;
    if (!groupBy) return [{ columna: 'all', items: data }];

    const map = new Map<string, T[]>();
    for (const item of data) {
        let val = item[groupBy];

        if (val !== null && typeof val === 'object') {
            val = val.nombre ?? val.nombre_comercial ?? val.razon_social ?? JSON.stringify(val);
        }

        const key = String(val ?? 'undefined');
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(item);
    }

    return Array.from(map.entries()).map(([columna, items]) => ({ columna, items }));
}

export function applyMods<T extends Record<string, any>>(
	data: T[],
	route: string
): Array<{ columna: string; items: T[] }> {
	return groupData(filterData(sortData(data, route), route), route);
}
