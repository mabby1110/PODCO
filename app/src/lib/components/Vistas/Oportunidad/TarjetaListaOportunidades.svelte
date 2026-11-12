<script lang="ts">
	import { goto } from '$app/navigation';
	import { fasesOportunidad } from '$lib';
	import ListPreview from '$lib/components/Tarjetas/ListPreview.svelte';
	import { formatDateFull, parseDateTimeLocal } from '$lib/utils/agenda';
	import { formatDateToReadable } from '$lib/utils/util';

	let { oportunidad } = $props();
	let fase = $derived(fasesOportunidad[oportunidad.fase]);
</script>

<ListPreview style={fase.estilo}>
	{#snippet titulo()}
		<h3>{oportunidad?.clientes.razon_social || oportunidad?.clientes.nombre_comercial}</h3>
		<p>{oportunidad?.motivo}</p>
	{/snippet}

	{#snippet contenido()}
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
					{#each oportunidad?.historia as item}
						<div class="entrada">
							<p>{formatDateToReadable(item.fecha)}:</p>
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
	{#snippet acciones()}
		<button class="butter" onclick={()=>goto(`/oportunidades/${oportunidad.id}`)}>ver</button>
	{/snippet}
	{#snippet metaDatos()}
		<p>{oportunidad?.agentes?.nombre}</p>
		<p>{formatDateToReadable(oportunidad?.inicio)}</p>
	{/snippet}
</ListPreview>
