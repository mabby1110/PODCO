<script lang="ts">
	import { page } from '$app/state';
	import { fasesOportunidad } from '$lib';
	import { StoreContextoRelacion } from '$lib/stores/pedidos/StoreContextoRelacion.svelte';
	import { formatDateFull, parseDateTimeLocal } from '$lib/utils/agenda';

	let oportunidad = $derived(
		page.data.oportunidades.find((p) => StoreContextoRelacion.id_oportunidad === p.id)
	);
	let show = $state(false);

	function handleClick(e: MouseEvent | KeyboardEvent) {
		e.preventDefault();
		show = !show;
	}
	console.log('oportunidad en tarjeta contexto', oportunidad);
</script>

{#if StoreContextoRelacion.id_oportunidad}
	<div class="tarjeta oportunidad" style={fasesOportunidad[oportunidad.fase].estilo}>
		<div class="titulo">
			<button class="butter milk" onclick={() => StoreContextoRelacion.limpiar()}>✕</button>
			<h3>{oportunidad?.clientes.razon_social || oportunidad?.clientes.nombre_comercial}</h3>
		</div>
		<p>{oportunidad?.motivo}</p>

		{#if show}
			{#if oportunidad?.objetivo}
				<div class="brief">
					<b>Objetivo</b>
					<p>{oportunidad?.objetivo}</p>
				</div>
			{/if}

			{#if oportunidad?.historia}
				<div class="brief">
					<b>Historia</b>
					<div class="entradas">
						{#each JSON.parse(oportunidad?.historia) as item}
							<div class="entrada">
								<p>{formatDateFull(parseDateTimeLocal(item.fecha))}:</p>
								{#if item.nombre_perfil}
									<p class="profile">{item.nombre_perfil},</p>
								{/if}
								<p>{item.entrada}</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
		<p>{oportunidad?.agentes?.nombre}</p>
	</div>
{/if}

<style>
	.oportunidad {
		flex-grow: 1;
		max-height: fit-content;
		display: flex;
		flex-direction: column;
		padding: 8px 8px;
		gap: var(--y);
	}
	.titulo {
		display: flex;
		align-items: baseline;
		gap: var(--y);
	}
</style>
