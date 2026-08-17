<script lang="ts">
  import * as echarts from 'echarts';

  interface Pedido {
    estatus: number;
    cantidad: number;
    precio_unitario: number;
  }

  interface Oportunidad {
    // Ya no dependemos de la fase de la oportunidad para el dinero,
    // sino del estatus atómico e inmutable de cada pedido.
    pedidos?: Pedido[];
  }

  interface Props {
    oportunidades?: Oportunidad[];
  }

  let { oportunidades = [] }: Props = $props();

  let chartContainer = $state<HTMLDivElement>();
  let chart = $state<echarts.ECharts>();

  let chartData = $derived.by(() => {
    // Agrupamos el dinero por el estatus real de los pedidos (1, 2 y 3)
    const dineroPorEstatus = new Map<number, number>([
      [1, 0], // Estatus 1: Borrador / Armando carrito
      [2, 0], // Estatus 2: Seleccionado / Relacionado a la OP
      [3, 0]  // Estatus 3: Cotizado / Inmutable (Enviado al cliente)
    ]);

    oportunidades.forEach(op => {
      if (!op.pedidos || op.pedidos.length === 0) return;

      op.pedidos.forEach(p => {
        // Solo nos interesa el dinero "en el aire" (estatus 1, 2 y 3)
        // Estatus 0 (descartado) y >= 4 (OCC/Ganado) no suman al pipeline pendiente
        if (p.estatus >= 1 && p.estatus <= 3) {
          const valor = (p.cantidad || 0) * (p.precio_unitario || 0);
          const actual = dineroPorEstatus.get(p.estatus)!;
          dineroPorEstatus.set(p.estatus, actual + valor);
        }
      });
    });

    return {
      etiquetas: ['1. En Borrador', '2. Seleccionados', '3. Cotizados (Enviado)'],
      valores: [
        dineroPorEstatus.get(1)!,
        dineroPorEstatus.get(2)!,
        dineroPorEstatus.get(3)!
      ]
    };
  });

  $effect(() => {
    if (!chartContainer) return;
    chart = echarts.init(chartContainer);
    
    const handleResize = () => chart?.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart?.dispose();
    };
  });

  $effect(() => {
    if (!chart) return;

    const option: echarts.EChartsCoreOption = {
      title: {
        text: 'Dinero sobre la mesa',
        subtext: 'Valor de los pedidos por estatus activo',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: function (params: any) {
          const valor = params[0].value.toLocaleString('es-MX', { style: 'currency', currency: 'USD' });
          return `${params[0].name}<br/>Monto: <b>${valor}</b>`;
        }
      },
      grid: { left: '3%', right: '3%', bottom: '8%', containLabel: true },
      xAxis: {
        type: 'category',
        data: chartData.etiquetas,
        axisLabel: { fontWeight: 'bold', color: '#4b5563' }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => `$${value.toLocaleString()}`
        }
      },
      series: [
        {
          name: 'Monto',
          type: 'bar',
          barWidth: '40%',
          data: chartData.valores,
          itemStyle: {
            color: function(params: any) {
              // Gris para borrador, Amarillo para seleccionado, Verde-azulado para ya cotizado
              const colores = ['#94a3b8', '#fbbf24', '#0ea5e9']; 
              return colores[params.dataIndex];
            },
            borderRadius: [6, 6, 0, 0]
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => `$${params.value.toLocaleString()}`,
            fontWeight: 'bold',
            color: '#1f2937'
          }
        }
      ]
    };

    chart.setOption(option);
  });
</script>

<div class="card agente-border">
  <div bind:this={chartContainer} style="width: 100%; height: 400px;"></div>
</div>

<style>
  .card { 
    background: #fff; 
    border-radius: 12px; 
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); 
    padding: 16px; 
    box-sizing: border-box; 
  }
  .agente-border { 
    border-top: 4px solid #10b981; 
  }
</style>