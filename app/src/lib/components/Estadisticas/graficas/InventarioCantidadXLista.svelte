<script lang="ts">
	import * as echarts from 'echarts';

	interface Inventario {
		cantidad: number;
		categoria?: string;
		codigo?: string;
		descripcion?: string;
		serie?: string;
		[key: string]: any;
	}

	let { data, titulo, categoria }: { data: Inventario[]; titulo: string; categoria: string } =
		$props();
	let chartRef: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (!chartRef || !data) return;

		const chart = echarts.init(chartRef);
		const top15 = data.slice(0, 15).reverse();

		chart.setOption({
			tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
			grid: { left: '3%', right: '10%', top: '5%', bottom: '10%', containLabel: true },
			xAxis: { type: 'value', minInterval: 1 },
			yAxis: {
				type: 'category',
				data: top15.map((c) => c.descripcion || c.codigo || 'Desconocido'),
				axisLabel: { width: 120, overflow: 'truncate' }
			},
			series: [
				{
					name: categoria,
					type: 'bar',
					data: top15.map((c) => c.cantidad || 0),
					label: { show: true, color: '#000' },
					itemStyle: { color: '#5470c6' }
				}
			]
		});

		const handleResize = () => chart.resize();
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			chart.dispose();
		};
	});
</script>

<div
	class="contenedor-grafica"
	style="display: flex; flex-direction: column; height: 100%; width: 100%;"
>
	<h1>{categoria} x {titulo}</h1>
	<div bind:this={chartRef} style="flex: 1; height: 80%;"></div>
</div>
