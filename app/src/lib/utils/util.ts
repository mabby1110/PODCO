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

export function filtrarPorAgente(lista: [], agenteId: string) {
	return lista.filter((item: any) => {
		return (
			item.id_agente === agenteId
			//   item.id_agente === "" ||
			//   item.id_agente === null
		);
	});
}

// src/lib/utils/util.ts

/**
 * Agrupa una lista de objetos por una propiedad de fecha específica.
 * @param items El array de elementos (Actividades u Oportunidades)
 * @param campoFecha El nombre de la propiedad que contiene la fecha (ej. 'inicio')
 */
export function agruparPorFecha<T>(items: T[], campoFecha: keyof T) {
	const grupos = new Map<string, T[]>();

	for (const item of items) {
		const valorFecha = item[campoFecha];

		// Si no hay fecha, podríamos agruparlos en "Sin fecha"
		if (!valorFecha) {
			const nombreGrupo = 'Sin fecha programada';
			if (!grupos.has(nombreGrupo)) grupos.set(nombreGrupo, []);
			grupos.get(nombreGrupo)!.push(item);
			continue;
		}

		// Extraemos la fecha (soporta strings "YYYY-MM-DD HH:mm" o fechas ISO)
		const fechaString =
			typeof valorFecha === 'string'
				? valorFecha.split(' ')[0]
				: new Date(valorFecha as any).toISOString().split('T')[0];

		// Damos formato legible
		const fechaObj = new Date(`${fechaString}T00:00:00`);
		const fechaLegible = isNaN(fechaObj.getTime())
			? fechaString
			: fechaObj.toLocaleDateString('es-ES', {
					weekday: 'long',
					day: 'numeric',
					month: 'long',
					year: 'numeric'
				});

		// Capitalizamos la primera letra
		const nombreGrupo = fechaLegible.charAt(0).toUpperCase() + fechaLegible.slice(1);

		if (!grupos.has(nombreGrupo)) {
			grupos.set(nombreGrupo, []);
		}
		grupos.get(nombreGrupo)!.push(item);
	}

	// Convertimos el Map a un Array
	return Array.from(grupos.entries()).map(([fecha, eventos]) => ({
		fecha,
		eventos
	}));
}
