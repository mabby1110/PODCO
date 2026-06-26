<script lang="ts">
	import * as echarts from 'echarts';

	interface Cliente {
		nombre_comercial: string;
		razon_social: string;
		oportunidades: any[];
	}

	let { data, titulo }: { data: Cliente[]; titulo: string } = $props();

	let chartRef: HTMLDivElement | null = $state(null);
	let chartInstance: echarts.ECharts | null = null;

	$effect(() => {
		if (!chartRef) return;

		chartInstance ??= echarts.init(chartRef);

		// Extracción de los primeros 10 elementos.
		// Se invierte el orden para que el motor de ECharts (barras horizontales) renderice el mayor en la parte superior.
		const topClientes = data.slice(0, 15).reverse();

		const nombres = topClientes.map((c) => c.nombre_comercial || c.razon_social || 'Desconocido');
		const valores = topClientes.map((c) => c.oportunidades?.length || 0);

		const option: echarts.EChartsOption = {
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'shadow' }
			},
			grid: {
				left: '3%',
				right: '10%',
				top: '5%',
				bottom: '10%',
				containLabel: true
			},
			xAxis: {
				type: 'value',
				minInterval: 1
			},
			yAxis: {
				type: 'category',
				data: nombres,
				axisLabel: {
					interval: 0,
					width: 120, // Limita el ancho del texto
					overflow: 'truncate' // Evita desbordamiento de nombres largos
				}
			},
			series: [
				{
					name: 'Oportunidades',
					type: 'bar',
					data: valores,
					label: {
						show: true,
						color: '#000'
					},
					itemStyle: {
						color: 'var(--color-1, #5470c6)' // Fallback integrado
					}
				}
			]
		};

		chartInstance.setOption(option);

		return () => {
			chartInstance?.dispose();
			chartInstance = null;
		};
	});

	$effect(() => {
		const handleResize = () => chartInstance?.resize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<div class="contenedor-grafica">
	<h1>{titulo}</h1>
    <div bind:this={chartRef} style="flex: 1; height: 80%;"></div>
</div>
