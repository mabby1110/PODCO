<script lang="ts">
	import * as echarts from 'echarts';

	// Definición de la interfaz para los datos de entrada
	interface DatosGrupo {
		grupo: string;
		elementos: [];
	}

	// Props utilizando las runas de Svelte 5
	let { data }: { data: DatosGrupo[] } = $props();

	// Referencia al elemento del DOM
	let chartRef: HTMLDivElement | null = $state(null);
	let chartInstance: echarts.ECharts | null = null;

	// Orquestación del ciclo de vida y reactividad con $effect
	$effect(() => {
		if (!chartRef) return;

		// Inicializar instancia si no existe
		if (!chartInstance) {
			chartInstance = echarts.init(chartRef);
		}

		// Extracción de datos para los ejes
		const nombresGrupos = data.map((d) => d.grupo).slice(0,10);
		const valoresCantidades = data.map((d) => d.elementos.length);

		// Configuración del gráfico
		const option: echarts.EChartsOption = {
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'shadow' }
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '15%', // Incrementado para dar espacio a las etiquetas rotadas
				containLabel: true
			},
			xAxis: {
				type: 'category',
				data: nombresGrupos,
				axisTick: { alignWithLabel: true },
				axisLabel: {
					interval: 0, // Fuerza el renderizado del 100% de las etiquetas
					rotate: 45 // Evita el solapamiento de textos largos
				}
			},
			yAxis: {
				type: 'value'
			},
			series: [
				{
					name: 'Cantidad',
					type: 'bar',
					barWidth: '60%',
					data: valoresCantidades,
					itemStyle: {
						color: '#5470c6'
					},
					label: {
						show: true,
						position: 'top', // Ubicación del número ('top', 'inside', 'bottom')
						color: '#000' // Color del texto
					}
				}
			]
		};

		// Aplicar opciones de forma reactiva cuando 'data' cambie
		chartInstance.setOption(option);

		// Limpieza al destruir el componente
		return () => {
			if (chartInstance) {
				chartInstance.dispose();
				chartInstance = null;
			}
		};
	});

	// Manejo del redimensionamiento de la ventana
	$effect(() => {
		const handleResize = () => chartInstance?.resize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<div bind:this={chartRef} style="width: 90%; height: 90%;"></div>
