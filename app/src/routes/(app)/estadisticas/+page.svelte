<script lang="ts">
	import { page } from '$app/state';
	import DineroXFase from '$lib/components/Vistas/Estadisticas/agente/DineroXFase.svelte';
	import EfectividadCierre from '$lib/components/Vistas/Estadisticas/agente/EfectividadCierre.svelte';
	import EmbudoVentas from '$lib/components/Vistas/Estadisticas/agente/EmbudoVentas.svelte';
	import GraficaEmbudoCotizaciones from '$lib/components/Vistas/Estadisticas/GraficaEmbudoCotizaciones.svelte';
	import GraficaIngresoPedidos from '$lib/components/Vistas/Estadisticas/GraficaIngresoPedidos.svelte';
	import GraficaOportunidadesXSector from '$lib/components/Vistas/Estadisticas/GraficaOportunidadesXSector.svelte';
	import GraficaRendimientoAgentesOportunidades from '$lib/components/Vistas/Estadisticas/GraficaRendimientoAgentesOportunidades.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';

	let { oportunidades } = $derived(page.data);
	console.log(oportunidades[0]);
</script>

<div class="dashboard-layout">
	<header class="dashboard-header">
		<h1>Dashboard de Operaciones</h1>
		<p>Resumen general del estado de la empresa</p>
	</header>

	{#if $profile?.isAdmin}
		<main class="chart-grid">
			<GraficaEmbudoCotizaciones {oportunidades} />
			<GraficaRendimientoAgentesOportunidades {oportunidades} />
			<GraficaIngresoPedidos {oportunidades} />
			<GraficaOportunidadesXSector {oportunidades} />
		</main>
	{:else}
		<main class="chart-grid">
			<EfectividadCierre {oportunidades} />
			<DineroXFase {oportunidades} />
			<EmbudoVentas {oportunidades}/>
		</main>
	{/if}
</div>

<style>
	.dashboard-layout {
		padding: 24px;
		max-width: 1600px;
		margin: 0 auto;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}

	.dashboard-header {
		margin-bottom: 32px;
	}

	.dashboard-header h1 {
		font-size: 2rem;
		font-weight: 700;
		color: #1f2937;
		margin: 0;
	}

	.dashboard-header p {
		color: #6b7280;
		margin: 4px 0 0 0;
	}

	.chart-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 450px), 1fr));
		gap: 24px;
		align-items: start;
	}

	.placeholder {
		background: #ffffff;
		border-radius: 12px;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
		height: 400px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #9ca3af;
		font-weight: 600;
		border: 2px dashed #e5e7eb;
	}
</style>
