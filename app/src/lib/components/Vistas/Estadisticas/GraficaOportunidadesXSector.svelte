<script lang="ts">
  import * as echarts from 'echarts';

  interface Oportunidad {
    agentes?: { nombre: string };
    clientes?: { sector: string };
  }

  interface Props {
    oportunidades?: Oportunidad[];
  }

  let { oportunidades = [] }: Props = $props();

  let chartContainer = $state<HTMLDivElement>();
  let chart = $state<echarts.ECharts>();

  let chartData = $derived.by(() => {
    const sectores = new Map<string, number>();

    oportunidades.forEach(op => {
      // Omitir el usuario de pruebas
      if (op.agentes?.nombre?.toLowerCase() === 'pruebas') return;

      // Limpiar y normalizar el sector
      const sectorRaw = op.clientes?.sector || 'SIN ESPECIFICAR';
      const sector = sectorRaw.trim().toUpperCase();

      sectores.set(sector, (sectores.get(sector) || 0) + 1);
    });

    // Convertir a array, ordenar de mayor a menor y separar en arreglos para ECharts
    const ordenado = Array.from(sectores.entries())
      .sort((a, b) => a[1] - b[1]); // Orden ascendente para que la barra mayor quede arriba en ECharts

    return {
      nombres: ordenado.map(item => item[0]),
      valores: ordenado.map(item => item[1])
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
        text: 'Oportunidades por Sector',
        subtext: 'Distribución de cuentas activas',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '6%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01],
        splitLine: { show: false } // Limpiar el ruido visual
      },
      yAxis: {
        type: 'category',
        data: chartData.nombres,
        axisLabel: {
          fontWeight: 'bold',
          color: '#4b5563' // Gris oscuro para mejor legibilidad
        }
      },
      series: [
        {
          name: 'Oportunidades',
          type: 'bar',
          data: chartData.valores,
          itemStyle: {
            color: '#6366f1', // Indigo, profesional y moderno
            borderRadius: [0, 4, 4, 0] // Redondear solo las esquinas derechas
          },
          label: {
            show: true,
            position: 'right', // Mostrar el número al final de la barra
            valueAnimation: true
          }
        }
      ]
    };

    chart.setOption(option);
  });
</script>

<div class="card admin-border">
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
  .admin-border { 
    border-top: 4px solid #8b5cf6; 
  }
</style>