export function concatStrings(anterior: string, nueva: string): string {
	if (!anterior || anterior.trim() === '') return nueva;
	return `${anterior}, ${nueva}`;
}
export function agregarEntrada(anterior: string, nueva: string) {
	if (!nueva || nueva.trim() === '') return anterior || '[]';

	const lista = anterior ? JSON.parse(anterior) : [];

	lista.push({
		fecha: new Date().toISOString(),
		entrada: nueva
	});
	return JSON.stringify(lista);
}
