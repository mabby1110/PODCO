
<script lang="ts">
	import * as echarts from 'echarts';

	interface Oportunidad {
		id: string;
		fase: number;
		createdAt: string | Date;
		agentes?: {
			nombre: string;
			isAdmin?: boolean;
		};
	}

	interface Props {
		oportunidades?: Oportunidad[];
	}
	let { oportunidades = [] }: Props = $props();
	console.log(oportunidades);

	let chartContainer = $state<HTMLDivElement>();
	let chart = $state<echarts.ECharts>();
	let vista = $state<'total' | 'mensual'>('total');

	let oportunidadesValidas = $derived(
		oportunidades.filter(
			(op) => op.agentes?.nombre?.toLowerCase() !== 'pruebas'
		)
	);

	let total = $derived(oportunidadesValidas.length);

	let chartData = $derived.by(() => {
		if (vista === 'total') {
			return {
				categorias: ['Total de oportunidades'],
				valores: [total]
			};
		}

		const stats = new Map<string, number>();

		oportunidadesValidas.forEach((op) => {
			const fecha = new Date(op.createdAt);

			if (isNaN(fecha.getTime())) return;

			const clave = `${fecha.getFullYear()}-${String(
				fecha.getMonth() + 1
			).padStart(2, '0')}`;

			stats.set(clave, (stats.get(clave) || 0) + 1);
		});

		const meses = Array.from(stats.keys()).sort();

		return {
			categorias: meses.map((mes) => {
				const [anio, numeroMes] = mes.split('-');
				return new Date(
					Number(anio),
					Number(numeroMes) - 1,
					1
				).toLocaleDateString('es-MX', {
					month: 'short',
					year: 'numeric'
				});
			}),
			valores: meses.map((mes) => stats.get(mes) || 0)
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
				text: 'Oportunidades',
				subtext: vista === 'total'
					? 'Total de oportunidades registradas'
					: 'Oportunidades registradas por mes',
				left: 'center'
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'shadow' }
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '8%',
				top: '25%',
				containLabel: true
			},
			xAxis: {
				type: 'category',
				data: chartData.categorias,
				axisLabel: {
					interval: 0
				}
			},
			yAxis: {
				type: 'value',
				name: 'Oportunidades',
				minInterval: 1
			},
			series: [
				{
					name: 'Oportunidades',
					type: 'bar',
					barMaxWidth: 55,
					data: chartData.valores,
					label: {
						show: true,
						position: 'top'
					},
					itemStyle: {
						color: '#8b5cf6',
						borderRadius: [6, 6, 0, 0]
					},
					emphasis: {
						focus: 'series'
					}
				}
			]
		};

		chart.setOption(option, true);
	});
</script>

<div class="card admin-border">
	<div class="header">
		<div class="total-container">
			<span class="total-label">Total de oportunidades</span>
			<strong class="total-number">{total}</strong>
		</div>

		<div class="controls">
			<button
				class:active={vista === 'total'}
				onclick={() => (vista = 'total')}
			>
				Total
			</button>

			<button
				class:active={vista === 'mensual'}
				onclick={() => (vista = 'mensual')}
			>
				Mensual
			</button>
		</div>
	</div>

	<div bind:this={chartContainer} style="width: 100%; height: 350px;"></div>
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

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 16px;
		margin-bottom: 12px;
	}

	.total-container {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.total-label {
		font-size: 13px;
		color: #64748b;
	}

	.total-number {
		font-size: 28px;
		font-weight: 700;
		color: #1e293b;
	}

	.controls {
		display: flex;
		gap: 4px;
		padding: 4px;
		background: #f1f5f9;
		border-radius: 8px;
	}

	.controls button {
		border: none;
		padding: 8px 16px;
		border-radius: 6px;
		cursor: pointer;
		background: transparent;
		color: #64748b;
		font-weight: 600;
		transition: all 0.2s;
	}

	.controls button.active {
		background: #8b5cf6;
		color: white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
</style>
