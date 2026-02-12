type Evento = Record<string, any>;

export function filtrarConsecutivo<T extends Evento>(
	keyword: string | number,
	atributo: keyof T,
	eventos: T[]
): T[] {
	const k = String(keyword).toLowerCase();
	return eventos.filter((e) =>
		String(e[atributo] ?? '')
			.toLowerCase()
			.includes(k)
	);
}

export function getStyleForPhase(fase: string | number) {
	const colorMap = {
		'0': 'background-color: var(--color-perdida);',
		'1': 'background-color: var(--color-prospecto);',
		'2': 'background-color: var(--color-analizar);',
		'3': 'background-color: var(--color-cotizar);',
		'4': 'background-color: var(--color-ganada);',
		'5': 'background-color: var(--color-enviar);',
		'6': 'background-color: var(--color-finalizar); color: white;'
	};
	return colorMap[String(fase)] || 'background-color: var(--color-prospecto);';
}

export function getDurationForPhase(fase: string | number) {
	const durationMap = {
		'0': 20,
		'1': 20,
		'2': 30,
		'3': 40,
		'4': 20,
		'5': 40,
		'6': 20
	};
	return durationMap[String(fase)] || 10;
}
