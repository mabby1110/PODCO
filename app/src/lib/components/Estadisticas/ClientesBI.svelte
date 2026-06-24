<script lang="ts">
	import { procesarProporcionOportunidades, procesarProporcionVisitas } from '$lib/utils/BI';
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import GraficaClientes from './GraficaClientes.svelte';
	import { appState } from '$lib/stores/appState.svelte';

	let { listaAgrupada } = $props();
	let ClientesXOp = $derived(procesarProporcionOportunidades(listaAgrupada));
	let ClientesXVisitas = $derived(procesarProporcionVisitas(listaAgrupada));
</script>

{#if $appState.BI}
	<div class="graficos" transition:slide>
		<GraficaClientes
			listaAgrupada={ClientesXOp}
			labels={['Con Oportunidad/es', 'Sin Oportunidad/es']}
			title="Clientes con oportunidades"
		/>
		<GraficaClientes listaAgrupada={ClientesXVisitas} title="Clientes con visitas" />
	</div>
{/if}

<style>
	.graficos {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		overflow: auto;
        width: 100%;
        padding: 0;
        max-height: 60vh;
	}
</style>
