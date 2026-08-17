<script lang="ts">
  import * as echarts from 'echarts';

  interface Pedido {
    estatus: number;
    cantidad: number;
    precio_unitario: number;
  }

  interface Oportunidad {
    fase: number;
    pedidos?: Pedido[];
  }

  interface Props {
    oportunidades?: Oportunidad[];
  }

  // Asumimos que RLS ya filtró esto para que sean solo las oportunidades de este agente
  let { oportunidades = [] }: Props = $props();

  let chartContainer = $state<HTMLDivElement>();
  let chart = $state<echarts.ECharts>();

  // Calculamos la efectividad basándonos en tu arquitectura inmutable
  let chartData = $derived.by(() => {
    let montoCotizado = 0; // Pedidos Estatus 3 (y sumamos el 4 porque lo cotizado incluye lo ganado)
    let montoGanado = 0;   // Pedidos Estatus 4 (OCC)

    oportunidades.forEach(op => {
      if (!op.pedidos || op.pedidos.length === 0) return;

      op.pedidos.forEach(p => {
        const valor = (p.cantidad || 0) * (p.precio_unitario || 0);
        
        if (p.estatus === 3) {
          montoCotizado += valor;
        } else if (p.estatus >= 4) { // 4 en adelante ya es dinero seguro
          montoGanado += valor;
          montoCotizado += valor; // Lo ganado también fue cotizado en su momento
        }
      });
    });

    // Evitar división por cero
    const porcentaje = montoCotizado > 0 ? (montoGanado / montoCotizado) * 100 : 0;

    return {
      cotizado: montoCotizado,
      ganado: montoGanado,
      tasa: parseFloat(porcentaje.toFixed(1))
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
        text: 'Efectividad de Cierre',
        subtext: `Cotizado: $${chartData.cotizado.toLocaleString()} | Ganado: $${chartData.ganado.toLocaleString()}`,
        left: 'center',
        subtextStyle: { fontWeight: 'bold', fontSize: 14 }
      },
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          radius: '90%',
          center: ['50%', '70%'], // Baja el centro porque es un medio círculo
          axisLine: {
            lineStyle: {
              width: 30,
              color: [
                [0.3, '#ef4444'], // Rojo si cierra menos del 30%
                [0.6, '#f59e0b'], // Amarillo entre 30% y 60%
                [1, '#10b981']    // Verde si cierra más del 60%
              ]
            }
          },
          pointer: {
            icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
            length: '12%',
            width: 20,
            offsetCenter: [0, '-60%'],
            itemStyle: { color: 'auto' }
          },
          axisTick: { length: 12, lineStyle: { color: 'auto', width: 2 } },
          splitLine: { length: 20, lineStyle: { color: 'auto', width: 5 } },
          axisLabel: {
            color: '#464646',
            fontSize: 16,
            distance: -60,
            formatter: '{value}%'
          },
          detail: {
            fontSize: 40,
            offsetCenter: [0, '20%'],
            valueAnimation: true,
            formatter: '{value}%',
            color: 'inherit'
          },
          data: [{ value: chartData.tasa, name: 'Tasa de Conversión' }]
        }
      ]
    };

    chart.setOption(option);
  });
</script>

<div class="card agente-border">
  <div bind:this={chartContainer} style="width: 100%; height: 350px;"></div>
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