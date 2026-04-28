<script lang="ts">
	import { procesarProporcionVisitas, renderChart } from '$lib/utils/BI';

	let { listaAgrupada = [], title = 'titulo', labels = ['Con Visitas', 'Sin Visitas'] } = $props();

	let datosProporcion = $derived(listaAgrupada);
	let config = $derived({
		type: 'pie',
		data: {
			labels: labels,
			title: 'ss',
			datasets: [
				{
					data: datosProporcion,
					backgroundColor: ['#2ECC40', '#FF4136']
				}
			]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				title: {
					display: true,
					text: title
				}
			},
			onClick: (event, elements, chart) => {
				console.log('click');
				if (elements.length > 0) {
					const dataIndex = elements[0].index;

					if (dataIndex === 0) {
						ejecutarFuncionCon();
					} else if (dataIndex === 1) {
						ejecutarFuncionSin();
					}
				}
			}
		}
	});

	// Declaración de las funciones
	function ejecutarFuncionCon() {
		console.log('Acción para: SI tienen la característica');
	}

	function ejecutarFuncionSin() {
		console.log('Acción para: NO tienen la característica');
	}
</script>

<div class="grafica">
	<canvas use:renderChart={config}></canvas>
</div>