<script lang="ts">
	import GraficasClientes from '$lib/components/Estadisticas/GraficasClientes.svelte';
	import GraficasInventario from '$lib/components/Estadisticas/GraficasInventario.svelte';
	import GraficasOportunidades from '$lib/components/Estadisticas/GraficasOportunidades.svelte';
</script>

<div class="page-content">
	<GraficasClientes />
	<GraficasOportunidades />
	<GraficasInventario />
</div>
