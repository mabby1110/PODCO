<script lang="ts">
	import { fasesOportunidad } from '$lib';
	import ListPreview from '$lib/components/Tarjetas/ListPreview.svelte';
	import { formatDateFull, parseDateTimeLocal } from '$lib/utils/agenda';

	let { oportunidad } = $props();
	let fase = $derived(fasesOportunidad[oportunidad.fase]);
</script>

<ListPreview href="/oportunidades/{oportunidad.id}" style={fase.estilo}>
	{#snippet header()}
		<h3>{oportunidad?.clientes.razon_social || oportunidad?.clientes.nombre_comercial}</h3>
		<p>{oportunidad?.motivo}</p>
	{/snippet}

	{#snippet content()}
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
	{/snippet}
	{#snippet meta()}
		<p>{oportunidad?.agentes?.nombre}</p>
		<p>{oportunidad?.inicio}</p>
	{/snippet}
</ListPreview>
