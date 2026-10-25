<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { fasesOportunidad } from '$lib';
	import { StoreContextoRelacion } from '$lib/stores/pedidos/StoreContextoRelacion.svelte';

	// DATOS DERIVADOS
	let oportunidad = $derived(
		page.data.oportunidades.find((p) => StoreContextoRelacion.id_oportunidad === p.id)
	);
</script>

{#if StoreContextoRelacion.id_oportunidad}
	<div class="butter oportunidad" style={fasesOportunidad[oportunidad.fase].estilo}>
		<div class="header">
			<button class="jelly rojo" onclick={() => StoreContextoRelacion.limpiar()}>✕</button>
			<div class="titulo">
				<h3>{oportunidad?.clientes.razon_social || oportunidad?.clientes.nombre_comercial}</h3>
				<div class="meta-titulo">
					<p>{oportunidad?.agentes?.nombre}: {oportunidad?.motivo}</p>
				</div>
			</div>
			<button class="butter" onclick={() => goto(`/oportunidades/${oportunidad.id}`)}
				>ver</button
			>
		</div>
	</div>
{/if}

<style>
	.oportunidad {
		flex-grow: 1;
		max-height: fit-content;
		display: flex;
		flex-direction: column;
		padding: var(--a);
	}
	.header {
		display: flex;
		align-items: baseline;
		gap: var(--y);
	}
	.header .titulo {
		flex-grow: 1;
	}
	.meta-titulo {
		display: flex;
		gap: var(--a);
		flex-wrap: wrap;
		font-size: small;
		justify-content: space-between;
	}
</style>
