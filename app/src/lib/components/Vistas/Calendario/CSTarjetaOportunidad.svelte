<script lang="ts">
	import { goto } from '$app/navigation';
	import { fasesOportunidad } from '$lib';
	import { appState } from '$lib/stores/appState.svelte';
	import { formatDateToReadable, obtenerIniciales } from '$lib/utils/util';
	let { oportunidad, expanded, style } = $props();

	let fase = $derived(fasesOportunidad[oportunidad.fase]);
</script>

<div class="tarjeta butter" class:min={!$appState.calendarCards} style="{style} {fase?.estilo}">
	{#if $appState.calendarCards || expanded}
		<div class="header">
			<h3>
				{oportunidad.clientes?.razon_social || oportunidad.clientes?.nombre_comercial}: {oportunidad.motivo}
			</h3>
			<div class="meta">
				<b>{oportunidad?.agentes?.nombre}</b>
			</div>
			<p class="motivo">{oportunidad?.objetivo}</p>
			<b class="motivo">{oportunidad?.necesidades}</b>
		</div>
	{:else}
		<div class="header-min">
			<b>{obtenerIniciales(oportunidad?.agentes?.nombre)}</b>
			<p>{oportunidad?.motivo}</p>
		</div>
	{/if}
	{#if expanded}
		<div class="acciones">
			<p class="date">{formatDateToReadable(oportunidad?.inicio)}</p>
			<button
				class="butter"
				onclick={(event) => {
					event.stopPropagation();
					goto(`/oportunidades/${oportunidad.id}`);
				}}
			>
				Ver
			</button>
		</div>
	{/if}
</div>

<style>
	.tarjeta {
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
		width: 100%;
		padding: var(--a);
		text-align: left;
		align-items: flex-start;
		overflow: hidden;
		z-index: 1;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		cursor: pointer;
	}
	.header {
		position: relative;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		gap: var(--b);
		width: 100%;
	}
	.header-min {
		display: flex;
		align-items: baseline;
		gap: var(--a);
	}
	.acciones {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		width: 100%;
	}
	.min {
		padding: 0;
	}
</style>
