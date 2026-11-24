<script lang="ts">
	import * as echarts from 'echarts';
	import { fasesOportunidad } from '$lib';

	interface Oportunidad {
		id?: string;
		fase: number;
		agentes?: {
			nombre?: string;
		};
	}

	interface Props {
		oportunidades?: Oportunidad[];
	}

	let { oportunidades = [] }: Props = $props();

	let chartContainer = $state<HTMLDivElement>();
	let chart = $state<echarts.ECharts>();

	const COLORES_FASE: Record<number, string> = {
		0: '#ff4444',
		1: '#c7d2fe',
		2: '#6699ff',
		3: '#eab308',
		4: '#34d76a',
		5: '#5ca8ff',
		6: '#eab308',
		7: '#34d76a',
		8: '#111827'
	};

	let oportunidadesValidas = $derived(
		oportunidades.filter((op) => op.agentes?.nombre?.toLowerCase() !== 'pruebas')
	);

	let total = $derived(oportunidadesValidas.length);

	let chartData = $derived.by(() => {
		const conteo = new Map<number, number>();

		oportunidadesValidas.forEach((op) => {
			const fase = Number(op.fase);
			if (!Number.isFinite(fase)) return;
			conteo.set(fase, (conteo.get(fase) || 0) + 1);
		});

		const pipeline = fasesOportunidad
			.filter((fase) => fase.id_fase >= 1)
			.map((fase) => ({
				value: conteo.get(fase.id_fase) || 0,
				name: `${fase.id_fase}. ${fase.actual}`,
				itemStyle: { color: COLORES_FASE[fase.id_fase] ?? '#94a3b8' },
				label: {
					color: fase.id_fase === 8 ? '#f8fafc' : '#0f172a'
				}
			}));

		return {
			pipeline,
			perdidas: conteo.get(0) || 0
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

		const maxValue = Math.max(...chartData.pipeline.map((d) => d.value), 1);

		const option: echarts.EChartsCoreOption = {
			title: {
				text: 'Embudo de ventas',
				subtext: 'Oportunidades por fase',
				left: 'center'
			},
			tooltip: {
				trigger: 'item',
				formatter: '{b}<br/><b>{c}</b> ({d}%)'
			},
			legend: {
				type: 'scroll',
				bottom: 0,
				data: chartData.pipeline.map((d) => d.name)
			},
			series: [
				{
					name: 'Oportunidades',
					type: 'funnel',
					left: '8%',
					top: 70,
					bottom: 56,
					width: '84%',
					min: 0,
					max: maxValue,
					minSize: '8%',
					maxSize: '100%',
					sort: 'none',
					gap: 2,
					label: {
						show: true,
						position: 'inside',
						formatter: '{c}',
						fontSize: 14,
						fontWeight: 'bold'
					},
					itemStyle: {
						borderColor: '#fff',
						borderWidth: 2
					},
					emphasis: {
						label: {
							fontSize: 18
						}
					},
					data: chartData.pipeline
				}
			]
		};

		chart.setOption(option, true);
	});
</script>

<div class="pan honey grafica admin-border">
	<div class="header">
		<div class="total-container">
			<span class="total-label">Total de oportunidades</span>
			<strong class="total-number">{total}</strong>
		</div>

		{#if chartData.perdidas > 0}
			<div class="total-container perdidas">
				<span class="total-label">Perdidas</span>
				<strong class="total-number">{chartData.perdidas}</strong>
			</div>
		{/if}
	</div>

	<div bind:this={chartContainer} style="width: 100%; height: 100%;"></div>
</div>

<style>
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

	.perdidas .total-number {
		color: #dc2626;
	}
</style>
