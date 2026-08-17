<script lang="ts">
  import * as echarts from 'echarts';

  // 1. Definimos las interfaces para TypeScript
  interface DataItem {
    value: number;
    name: string;
  }

  interface Props {
    data?: DataItem[];
  }

  // 2. Usamos la runa $props() para recibir los datos, con un valor por defecto
  let { 
    data = [
      { value: 60, name: 'Fase 1: Análisis' },
      { value: 35, name: 'Fase 2: Negociación' },
      { value: 20, name: 'Fase 3: Cotización' }
    ] 
  }: Props = $props();

  // 3. Usamos la runa $state() para las referencias cambiantes
  let chartContainer = $state<HTMLDivElement>();
  let chart = $state<echarts.ECharts>();

  // 4. Primer $effect: Inicialización y limpieza del ciclo de vida
  $effect(() => {
    // Si el div contenedor aún no está en el DOM, no hacemos nada
    if (!chartContainer) return;

    // Inicializamos la instancia
    chart = echarts.init(chartContainer);

    // Manejo de responsive
    const handleResize = () => chart?.resize();
    window.addEventListener('resize', handleResize);

    // Función de limpieza al destruir el componente
    return () => {
      window.removeEventListener('resize', handleResize);
      chart?.dispose();
    };
  });

  // 5. Segundo $effect: Reactividad ante cambios en `data`
  $effect(() => {
    // Solo actualizamos si la gráfica ya está inicializada
    if (!chart) return;

    // Calculamos el valor máximo dinámicamente para el tope del embudo
    const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value)) : 100;

    const option: echarts.EChartsCoreOption = {
      title: {
        text: 'Embudo de Oportunidades',
        subtext: 'Distribución por fases',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      toolbox: {
        feature: { saveAsImage: { title: 'Guardar' } }
      },
      legend: {
        bottom: 0,
        data: data.map(item => item.name) // Reactivo a la data
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
          minSize: '0%',
          maxSize: '100%',
          sort: 'descending',
          gap: 2,
          label: {
            show: true,
            position: 'inside'
          },
          labelLine: {
            length: 10,
            lineStyle: { width: 1, type: 'solid' }
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1
          },
          emphasis: { label: { fontSize: 20 } },
          data: data // Le pasamos el arreglo reactivo
        }
      ]
    };

    // Actualiza la gráfica eficientemente sin reinicializar el lienzo
    chart.setOption(option);
  });
</script>

<div class="card">
  <!-- Svelte 5 sigue usando bind:this de la misma forma -->
  <div bind:this={chartContainer} style="width: 100%; height: 400px;"></div>
</div>

<style>
  .card {
    background: var(--color-background);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    padding: 16px;
    margin-bottom: 20px;
  }
</style>