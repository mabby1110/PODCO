<script lang="ts">
	import * as echarts from 'echarts';

	interface Pedido {
		cantidad: number;
		precio_unitario: number;
	}

	interface Oportunidad {
		fecha_creacion: string;
		agentes?: { nombre: string };
		pedidos?: Pedido[];
	}

	interface Props {
		oportunidades?: Oportunidad[];
	}

	let { oportunidades = [] }: Props = $props();

	let chartContainer = $state<HTMLDivElement>();
	let chart = $state<echarts.ECharts>();

	// Procesamiento de datos: Dinero real a partir del array de pedidos
	let chartData = $derived.by(() => {
		const ventasPorMes = new Map<string, number>();

		oportunidades.forEach((op) => {
			// 1. Omitir datos de prueba
			// if (op.agentes?.nombre?.toLowerCase() === 'pruebas') return;

			// 2. Solo contar si la oportunidad tiene pedidos
			if (!op.pedidos || op.pedidos.length === 0) return;

			// 3. Obtener el mes y año (Ej: "2026-08")
			const date = new Date(op.fecha_creacion);
			const mesAnio = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

			// 4. Sumar el valor real de los pedidos (SOLO ESTATUS 4)
			let totalOportunidad = 0;
			op.pedidos.forEach((p) => {
				if (p.estatus === 4) {
					const cantidad = p.cantidad || 0;
					const precio = p.precio_unitario || 0;
					totalOportunidad += cantidad * precio;
				}
			});

			// Solo acumulamos si realmente hubo pedidos ganados en esta oportunidad,
			// para evitar registrar meses en $0 si solo hubo cotizaciones fallidas ese mes.
			if (totalOportunidad > 0) {
				const actual = ventasPorMes.get(mesAnio) || 0;
				ventasPorMes.set(mesAnio, actual + totalOportunidad);
			}
		});

		// Ordenar cronológicamente
		const mesesOrdenados = Array.from(ventasPorMes.keys()).sort();
		const totales = mesesOrdenados.map((mes) => ventasPorMes.get(mes)!);

		return { meses: mesesOrdenados, totales };
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
				text: 'Ingresos por Pedidos Reales',
				subtext: 'Calculado desde los items generados',
				left: 'center'
			},
			tooltip: {
				trigger: 'axis',
				formatter: function (params: any) {
					const valor = params[0].value.toLocaleString('es-MX', {
						style: 'currency',
						currency: 'USD'
					});
					return `${params[0].name}<br/>Total: <b>${valor}</b>`;
				}
			},
			grid: { left: '5%', right: '5%', bottom: '10%', containLabel: true },
			xAxis: {
				type: 'category',
				data: chartData.meses,
				axisLabel: { rotate: 45 }
			},
			yAxis: {
				type: 'value',
				axisLabel: {
					formatter: (value: number) => `$${value.toLocaleString()}`
				}
			},
			series: [
				{
					data: chartData.totales,
					type: 'bar',
					itemStyle: { color: '#0ea5e9', borderRadius: [4, 4, 0, 0] },
					barMaxWidth: 60
				},
				{
					data: chartData.totales,
					type: 'line',
					smooth: true,
					itemStyle: { color: '#f59e0b' },
					lineStyle: { width: 3 }
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
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		padding: 16px;
		box-sizing: border-box;
	}
	.admin-border {
		border-top: 4px solid #8b5cf6;
	}
</style>
