<script lang="ts">
	import * as echarts from 'echarts';

	interface Oportunidad {
		id: string;
		fase: number;
		agentes?: {
			nombre: string;
			isAdmin?: boolean;
		};
	}

	interface Props {
		oportunidades?: Oportunidad[];
	}

	let { oportunidades = [] }: Props = $props();
	let chartContainer = $state<HTMLDivElement>();
	let chart = $state<echarts.ECharts>();

	let chartData = $derived.by(() => {
		const stats = new Map<string, { ganadas: number; enProceso: number }>();

		oportunidades.forEach((op) => {
			const nombreAgente = op.agentes?.nombre || 'Sin asignar';
			if (nombreAgente.toLowerCase() === 'pruebas') {
				return;
			}

			if (!stats.has(nombreAgente)) {
				stats.set(nombreAgente, { ganadas: 0, enProceso: 0 });
			}

			const current = stats.get(nombreAgente)!;

			if (op.fase >= 4) {
				current.ganadas += 1;
			} else {
				current.enProceso += 1;
			}
		});

		return {
			nombres: Array.from(stats.keys()),
			ganadas: Array.from(stats.values()).map((v) => v.ganadas),
			enProceso: Array.from(stats.values()).map((v) => v.enProceso)
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
				text: 'Rendimiento por Agente',
				subtext: 'Vista exclusiva de Administrador',
				left: 'center'
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'shadow' }
			},
			legend: {
				bottom: 0
			},
			grid: {
				left: '3%',
				right: '6%',
				bottom: '12%',
				containLabel: true
			},
			xAxis: {
				type: 'value',
				name: 'Oportunidades'
			},
			yAxis: {
				type: 'category',
				data: chartData.nombres
			},
			series: [
				{
					name: 'Ganadas (Fase 4+)',
					type: 'bar',
					stack: 'total',
					label: { show: true },
					emphasis: { focus: 'series' },
					itemStyle: { color: '#10b981' },
					data: chartData.ganadas
				},
				{
					name: 'En Proceso (Fase 1-3)',
					type: 'bar',
					stack: 'total',
					label: { show: true },
					emphasis: { focus: 'series' },
					itemStyle: { color: '#3b82f6' },
					data: chartData.enProceso
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
		background: #ffffff;
		border-radius: 12px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		padding: 16px;
		width: 100%;
		box-sizing: border-box;
	}

	.admin-border {
		border-top: 4px solid #8b5cf6;
	}
</style>
