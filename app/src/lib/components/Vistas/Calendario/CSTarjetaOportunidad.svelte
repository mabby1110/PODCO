<script lang="ts">
	import { goto } from '$app/navigation';
	import { fasesOportunidad } from '$lib';
	import { draggable } from '$lib/actions/dnd';
	import { appState } from '$lib/stores/appState.svelte';

	let { oportunidad, expanded, style } = $props();
	
	let fase = $derived(fasesOportunidad[oportunidad.fase]);
	const isDndEnabled = $derived($appState.dnd);
</script>

<div
	class="tarjeta jelly"
	style="{style} {fase?.estilo}"
	use:draggable={{ data: oportunidad.id, enabled: isDndEnabled }}
>
	{#if expanded}
		<div class="header">
			<b class="title">{oportunidad?.razon_social || oportunidad?.nombre_comercial}</b>
			<div class="meta-min">
				<b>{oportunidad?.agentes?.nombre}</b>
				<p>{oportunidad?.motivo}</p>
				<p class="motivo">{oportunidad?.objetivo}</p>
				<b class="motivo">{oportunidad?.necesidades}</b>
			</div>
		</div>
	{:else}
		<div class="header">
			<p>{oportunidad?.motivo}</p>
			<b class="title">{oportunidad?.razon_social || oportunidad?.nombre_comercial}</b>
			<div class="meta">
				<b>{oportunidad?.agentes?.nombre}</b>
			</div>
		</div>
	{/if}
	{#if expanded}
		<button class="butter" onclick={() => goto(`/oportunidades/${oportunidad.id}`)}> Ver </button>
	{/if}
</div>

<style>
	.tarjeta {
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
		width: 100%;
		text-align: left;
		align-items: flex-start;
		overflow: hidden;
		z-index: 1;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		pointer-events: auto;
		cursor: pointer;
	}
	.header {
		position: relative;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
	}
	.title {
		width: 80%;
		word-break: break-all;
		min-width: 100%;
	}
	.date {
		position: absolute;
		top: 0;
		right: 0;
		font-size: smaller;
	}
	.meta {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
	.butter {
		align-self: flex-end;
	}
</style>
