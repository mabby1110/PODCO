<script lang="ts">
	import { page } from '$app/state';
	import { fasesActividad } from '$lib';
	import ListPreview from '$lib/components/Tarjetas/ListPreview.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { formatDateFull, parseDateTimeLocal } from '$lib/utils/agenda';
	import { getStyleForPhase } from '$lib/utils/util';

	let { actividad } = $props();
	let fase = $derived(fasesActividad[actividad.fase]);
</script>

<ListPreview href="/actividades/{actividad.id}" style={fase?.estilo}>
	{#snippet header()}
		<h3>{actividad?.motivo}</h3>
	{/snippet}
	{#snippet content()}
		{#if actividad?.objetivo}
			<div class="brief">
				<b>Objetivo</b>
				<p>{actividad?.objetivo}</p>
			</div>
		{/if}
		{#if actividad?.historia}
			<div class="brief">
				<h3>Historia</h3>
				<div class="entradas">
					{#each JSON.parse(actividad?.historia) as item}
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
		{:else}
			<p>no hay entradas</p>
		{/if}
	{/snippet}

	{#snippet meta()}
		<p>{formatDateFull(parseDateTimeLocal(actividad?.inicio))}</p>
		<p>{actividad?.agente?.nombre}</p>
	{/snippet}
</ListPreview>
