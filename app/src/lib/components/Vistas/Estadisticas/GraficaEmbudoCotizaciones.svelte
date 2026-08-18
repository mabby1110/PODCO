<script lang="ts">
	import * as echarts from 'echarts';

	interface Oportunidad {
		fase: number;
		agentes?: {
			nombre: string;
		};
	}

	interface Props {
		oportunidades?: Oportunidad[];
	}

	// Se asume que este arreglo ya viene filtrado por RLS para el agente actual.
	let { oportunidades = [] }: Props = $props();

	let chartContainer = $state<HTMLDivElement>();
	let chart = $state<echarts.ECharts>();

	// Procesamos únicamente las fases que le conciernen al vendedor
	let chartData = $derived.by(() => {
		const conteoFases = new Map<number, number>([
			[1, 0], // Fase 1: Borrador / Prospección
			[2, 0], // Fase 2: Negociación / Potencial
			[3, 0], // Fase 3: Cotización (Inmutable)
			[4, 0] // Fase 4: OCC / Ganado
		]);

		oportunidades.forEach((op) => {
			// Omitir datos de prueba por seguridad
			if (op.agentes?.nombre?.toLowerCase() === 'pruebas') return;

			// Ignorar datos corruptos o fases operativas (5 al 8)
			if (op.fase >= 1 && op.fase <= 4) {
				const actual = conteoFases.get(op.fase)!;
				conteoFases.set(op.fase, actual + 1);
			}
		});

		return [
			{ value: conteoFases.get(1)!, name: '1. Borrador' },
			{ value: conteoFases.get(2)!, name: '2. Negociación' },
			{ value: conteoFases.get(3)!, name: '3. Cotización' },
			{ value: conteoFases.get(4)!, name: '4. OCC (Ganada)' }
		];
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

		// Calcular un máximo dinámico para proporcionar visualmente el embudo.
		// Si todas las fases están en 0, usamos 10 por defecto.
		const maxValue = Math.max(...chartData.map((d) => d.value)) || 10;

		const option: echarts.EChartsCoreOption = {
			title: {
				text: 'Mi Embudo de Ventas',
				subtext: 'Volumen de oportunidades activas (Fases 1 a 4)',
				left: 'center'
			},
			tooltip: {
				trigger: 'item',
				formatter: '{a} <br/>{b} : {c} ({d}%)'
			},
			legend: {
				bottom: 0,
				data: chartData.map((d) => d.name)
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
					minSize: '5%', // Evita que la base desaparezca si el valor es 0
					maxSize: '100%',
					sort: 'none', // Crucial: Mantiene el orden cronológico estricto (1 -> 4)
					gap: 2,
					label: {
						show: true,
						position: 'inside',
						formatter: '{c}', // Muestra solo el número entero de oportunidades
						fontSize: 16,
						fontWeight: 'bold'
					},
					labelLine: {
						length: 10,
						lineStyle: {
							width: 1,
							type: 'solid'
						}
					},
					itemStyle: {
						borderColor: '#fff',
						borderWidth: 2,
						// Progresión de colores: Gris -> Amarillo -> Azul -> Verde (Cierre)
						color: function (params: any) {
							const colores = ['#94a3b8', '#0ea5e9', '#fbbf24', '#10b981'];
							return colores[params.dataIndex];
						}
					},
					emphasis: {
						label: {
							fontSize: 20
						}
					},
					data: chartData
				}
			]
		};

		chart.setOption(option);
	});
</script>

<div class="card agente-border">
	<div bind:this={chartContainer} style="width: 100%; height: 400px;"></div>
</div>

<style>
	.card {
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		padding: 16px;
		box-sizing: border-box;
	}

	.agente-border {
		border-top: 4px solid #10b981;
	}
</style>
