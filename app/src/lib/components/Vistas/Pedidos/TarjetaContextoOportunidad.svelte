<script lang="ts">
	import { page } from '$app/state';
	import { StoreContextoRelacion } from '$lib/stores/pedidos/StoreContextoRelacion.svelte';
	import TarjetaListaOportunidades from '../Oportunidad/TarjetaListaOportunidades.svelte';

	let oportunidad = $derived(
		page.data.oportunidades.find((p) => StoreContextoRelacion.id_oportunidad === p.id)
	);

	console.log('oportunidad en tarjeta contexto', oportunidad);

</script>

{#if StoreContextoRelacion.id_oportunidad}
	<div class="tarjeta-contexto">
		<button class="butter chile" onclick={StoreContextoRelacion.limpiar}>✕</button>
		<TarjetaListaOportunidades event={oportunidad} />
	</div>
{/if}

<style>
	.tarjeta-contexto {
		display: flex;
		gap: var(--a);
	}
</style>
