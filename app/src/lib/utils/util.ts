export function getStyleForPhase(fase: string | number) {
	const colorMap = {
		'0': 'background-color: var(--color-perdida);',
		'1': 'background-color: var(--color-prospecto);',
		'2': 'background-color: var(--color-analizar);',
		'3': 'background-color: var(--color-cotizar);',
		'4': 'background-color: var(--color-ganada);',
		'5': 'background-color: var(--color-enviar);',
		'6': 'background-color: var(--color-finalizar); color: var(--color-text-ob);'
	};
	return colorMap[String(fase)] || 'background-color: var(--color-prospecto);';
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

export const formatCurrency = (value: string, currency: string) => {
  // Ajustamos la región según la moneda para un formato más natural
  const locale = currency === 'MXN' ? 'es-MX' : 'en-US';
  const ammount = Number(value);

  if(ammount > 0) {
	  return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currency,
	  }).format(ammount);
  } else {
	return null
  }
};