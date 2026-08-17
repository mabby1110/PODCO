<script lang="ts">
  import * as echarts from 'echarts';

  interface Oportunidad {
    fase: number;
  }

  interface Props {
    oportunidades?: Oportunidad[];
  }

  // Se asume que este arreglo ya viene filtrado por RLS (Row Level Security) 
  // para pertenecer únicamente al agente actual.
  let { oportunidades = [] }: Props = $props();

  let chartContainer = $state<HTMLDivElement>();
  let chart = $state<echarts.ECharts>();

  // Procesamos únicamente las fases que le conciernen al vendedor
  let chartData = $derived.by(() => {
    const conteoFases = new Map<number, number>([
      [1, 0], // Borrador / Prospección
      [2, 0], // Potencial / Negociación
      [3, 0], // Cotización (Inmutable)
      [4, 0]  // OCC / Ganado
    ]);

    oportunidades.forEach(op => {
      // Ignorar datos corruptos o fases operativas (5 al 8)
      if (op.fase >= 1 && op.fase <= 4) {
        const actual = conteoFases.get(op.fase)!;
        conteoFases.set(op.fase, actual + 1);
      }
    });

    return [
      { value: conteoFases.get(1)!, name: '1. Borrador' },
      { value: conteoFases.get(2)!, name: '2. Negociación' },
      { value: conteoFases.get(3)!, name: '3. Cotización' },
      { value: conteoFases.get(4)!, name: '4. OCC (Ganada)' }
    ];
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

    // Calcular un máximo dinámico para que el embudo se proporcione bien visualmente
    // Si todas son 0, ponemos un máximo de 10 por defecto.
    const maxValue = Math.max(...chartData.map(d => d.value)) || 10;

    const option: echarts.EChartsCoreOption = {
      title: {
        text: 'Mi Embudo de Ventas',
        subtext: 'Volumen de oportunidades (Fases 1 a 4)',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        bottom: 0,
        data: chartData.map(d => d.name)
      },
      series: [
        {
          name: 'Oportunidades',
          type: 'funnel',
          left: '10%',
          top: 60,
          bottom: 60,
          width: '80%',
          min: 0,
          max: maxValue,
          minSize: '5%',   // Para que la base no se vea en punta si llega a cero
          maxSize: '100%',
          sort: 'none',    // Crucial: Mantiene el orden cronológico (Fase 1 -> 4)
          gap: 2,
          label: {
            show: true,
            position: 'inside',
            formatter: '{c}', // Solo mostrar el número entero adentro
            fontSize: 16,
            fontWeight: 'bold'
          },
          labelLine: {
            length: 10,
            lineStyle: {
              width: 1,
              type: 'solid'
            }
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
            // Colores progresivos (del frío al cálido/verde para el cierre)
            color: function(params: any) {
              const colores = ['#94a3b8', '#fbbf24', '#0ea5e9', '#10b981'];
              return colores[params.dataIndex];
            }
          },
          emphasis: {
            label: {
              fontSize: 20
            }
          },
          data: chartData
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
  
  /* Borde verde para denotar perfil de agente */
  .agente-border { 
    border-top: 4px solid #10b981; 
  }
</style>