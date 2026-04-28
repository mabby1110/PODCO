import Chart from 'chart.js/auto';

export function renderChart(node: HTMLCanvasElement, config: any) {
  const chartInstance = new Chart(node, config);

  return {
    update(newConfig: any) {
      // Mutación eficiente: actualiza datos sin destruir la instancia
      chartInstance.data = newConfig.data;
      chartInstance.options = newConfig.options;
      chartInstance.update();
    },
    destroy() {
      chartInstance.destroy();
    }
  };
}
// Agregar en la parte superior del archivo (ej. BI.ts)
export type Elemento = {
  id: string | number;
  op: number;
  visitas: number;
  [key: string]: any;
};

export type Grupo = {
  key: string;
  elementos: Elemento[];
};
export function procesarProporcionVisitas(listaAgrupada: Grupo[] = []) {
  if (!listaAgrupada || listaAgrupada.length === 0) return [0, 0];
  const mapaClientes = new Map<string | number, number>();

  // Acumulación de visitas por ID para prevenir falsos negativos en registros duplicados
  listaAgrupada.flatMap(g => g.elementos).forEach(el => {
    const visitasActuales = mapaClientes.get(el.id) || 0;
    mapaClientes.set(el.id, visitasActuales + el.visitas);
  });

  let conVisitas = 0;
  let sinVisitas = 0;

  for (const totalVisitas of mapaClientes.values()) {
    if (totalVisitas > 0) conVisitas++;
    else sinVisitas++;
  }

  return [conVisitas, sinVisitas];
}
export function procesarProporcionOportunidades(listaAgrupada: Grupo[] = []) {
  if (!listaAgrupada || listaAgrupada.length === 0) return [0, 0];
  const mapaClientes = new Map<string | number, number>();

  // Acumulación de Oportunidades por ID para prevenir falsos negativos en registros duplicados
  listaAgrupada.flatMap(g => g.elementos).forEach(el => {
    const OportunidadesActuales = mapaClientes.get(el.id) || 0;
    mapaClientes.set(el.id, OportunidadesActuales + el.op);
  });

  let conOportunidades = 0;
  let sinOportunidades = 0;

  for (const totalOportunidades of mapaClientes.values()) {
    if (totalOportunidades > 0) conOportunidades++;
    else sinOportunidades++;
  }

  return [conOportunidades, sinOportunidades];
}