export function concatStrings(anterior: string, nueva: string): string {
	if (!anterior || anterior.trim() === '') return nueva;
	return `${anterior}, ${nueva}`;
}
export function agregarEntrada(anterior: string, nueva: string, agente?: any) {
	if (!nueva || nueva.trim() === '') return anterior || '[]';

	const lista = anterior ? JSON.parse(anterior) : [];

	lista.push({
		nombre_perfil: agente.nombre,
		id: agente.id,
		fecha: new Date().toISOString(),
		entrada: nueva
	});
	return JSON.stringify(lista);
}
