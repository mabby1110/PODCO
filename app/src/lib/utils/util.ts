type Evento = Record<string, any>;

export function filtrarConsecutivo<T extends Evento>(
	keyword: string | number,
	atributo: keyof T,
	eventos: T[]
): T[] {
    const k = String(keyword).toLowerCase();
	return eventos.filter(e =>
		String(e[atributo] ?? '').toLowerCase().includes(k)
	);
}