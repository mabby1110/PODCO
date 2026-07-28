<script lang="ts">
	import { colorMap, fases } from '$lib';
	import * as echarts from 'echarts';

	interface DatosGrupo {
		grupo: string;
		elementos: { fase: number }[];
	}

	let { data }: { data: DatosGrupo[] } = $props();

	let chartRef: HTMLDivElement | null = $state(null);
	let chartInstance: echarts.ECharts | null = null;

	$effect(() => {
		if (!chartRef) return;

		if (!chartInstance) {
			chartInstance = echarts.init(chartRef);
		}

		const recuento = data.reduce<Record<number, number>>((acc, grupo) => {
			grupo.elementos.forEach((op) => {
				acc[op.fase] = (acc[op.fase] || 0) + 1;
			});
			return acc;
		}, {});

		const datosEmbudo = Object.entries(recuento)
			.sort(([faseA], [faseB]) => Number(faseA) - Number(faseB))
			.map(([fase, cantidad]) => {
				const idFase = Number(fase);
				const faseObj = fases.find((f) => f.id_fase === idFase);
				return {
					value: cantidad,
					name: faseObj ? faseObj.actual : `Fase ${idFase}`,
					itemStyle: {
						color: `#${faseObj?.color}`
					}
				};
			});

		const option: echarts.EChartsOption = {
			tooltip: {
				trigger: 'item',
				formatter: '{a} <br/>{b}: {c}'
			},
			series: [
				{
					name: 'Oportunidades',
					type: 'funnel',
					left: '10%',
					width: '80%',
					height: '80%',
					sort: 'none',
					label: {
						show: true,
						position: 'inside',
						formatter: '{b}: {c}',
                        color: '#000000'
					},
					itemStyle: {
						borderColor: '#fff',
						borderWidth: 1
					},
					data: datosEmbudo
				}
			]
		};

		chartInstance.setOption(option);

		return () => {
			if (chartInstance) {
				chartInstance.dispose();
				chartInstance = null;
			}
		};
	});

	$effect(() => {
		const handleResize = () => chartInstance?.resize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<div class="contenedor-grafica">
	<div bind:this={chartRef} style="width: 100%; height: 100%;"></div>
</div>
