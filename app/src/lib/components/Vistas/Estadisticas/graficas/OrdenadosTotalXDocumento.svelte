<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Cliente } from '$lib';
	import * as echarts from 'echarts';

	interface Documento {
		id_oportunidad?: string;
		id_cliente?: string;
		id_agente?: string;
		total?: number;
		clientes?: Cliente;
		[key: string]: any;
	}

	let { data, titulo }: { data: Documento[]; titulo: string } = $props();

	let chartRef: HTMLDivElement | undefined = $state();
	let topN: number = $state(10);
	let chart: echarts.ECharts | undefined;

	$effect(() => {
		if (!chartRef || !data) return;

		chart ??= echarts.init(chartRef);

		const procesados = data.slice(0, topN).reverse();

		chart.setOption({
			tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
			grid: { left: '3%', right: '10%', top: '5%', bottom: '10%', containLabel: true },
			xAxis: { type: 'value' },
			yAxis: {
				type: 'category',
				data: procesados.map(
					(p) => p.clientes?.nombre_comercial || p.clientes?.razon_social || 'Desconocido'
				),
				axisLabel: { width: 120, overflow: 'truncate' },
				triggerEvent: true
			},
			series: [
				{
					name: 'Total cotizado sin iva',
					type: 'bar',
					data: procesados.map((p) => Number(p.total) || 0),
					label: { show: true, position: 'right', color: '#000' },
					itemStyle: { color: 'var(--color-1, #5470c6)' }
				}
			]
		});

		chart.off('click');
		chart.on('click', 'yAxis', (params) => {
			alert(`cliente:`);
			const id_cliente = procesados[params.dataIndex]?.id_cliente;
			if (id_cliente) {
				goto(`/clientes/${id_cliente}`);
			}
		});
	});

	$effect(() => {
		const handleResize = () => chart?.resize();
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			chart?.dispose();
		};
	});
</script>

<div
	class="contenedor-grafica"
	style="display: flex; flex-direction: column; height: 90%; width: 90%;"
>
	<div style="display: flex; justify-content: space-between; align-items: center;">
		<h2>{titulo}</h2>
		<select bind:value={topN} style="padding: 4px 8px; border-radius: 4px;">
			<option value={5}>Top 5</option>
			<option value={10}>Top 10</option>
			<option value={50}>Top 50</option>
		</select>
	</div>
	<div bind:this={chartRef} style="flex: 1; min-height: 300px;"></div>
</div>
