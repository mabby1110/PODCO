<script lang="ts">
	import { goto } from '$app/navigation';
	import { fasesActividad } from '$lib';
	import TarjetaPrevista from '$lib/components/Tarjetas/TarjetaPrevista.svelte';
	import { formatDateFull, parseDateTimeLocal } from '$lib/utils/agenda';
	import { formatDateToReadable, getStyleForPhase } from '$lib/utils/util';

	let { actividad } = $props();
	let fase = $derived(fasesActividad[actividad.fase]);
</script>

<TarjetaPrevista style={fase.estilo}>
	{#snippet titulo()}
		<h3>{actividad?.motivo}</h3>
	{/snippet}
	{#snippet contenido()}
		{#if actividad?.objetivo}
			<div class="brief">
				<b>Objetivo</b>
				<p>{actividad?.objetivo}</p>
			</div>
		{/if}
	{/snippet}
	{#snippet mas()}
		{#if actividad?.historia}
			<div class="brief">
				<b>Historia</b>
				<div class="entradas">
					{#each actividad?.historia as item}
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

	{#snippet acciones()}
		<button
			class="butter accion"
			onclick={(e) => {
				e.stopPropagation();
				goto(`/actividades/${actividad.id}`);
			}}>ver</button
		>
	{/snippet}
	{#snippet meta()}
		<p>{actividad?.agentes?.nombre}</p>
		<p>{formatDateToReadable(actividad?.inicio)}</p>
	{/snippet}
</TarjetaPrevista>
