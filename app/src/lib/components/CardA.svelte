<script lang="ts">
	import { page } from '$app/state';
	import { draggable } from '$lib/actions/dnd';
	import { appState } from '$lib/stores/appState.svelte';
	import { selectedEvent } from '$lib/stores/selectedEvent';

	let { event } = $props();

	const { clientes, agentes } = $derived(page.data);
	const razon_social = $derived(clientes[event.id_cliente]?.razon_social ?? '');
	const agente = $derived(agentes.find((e) => e.id_agente == event.id_agente)?.nombre ?? '');
	const isDndEnabled = $derived($appState.dnd);

	const style = $derived.by(() => {
		const colorMap = {
			'0': 'background-color: var(--color-perdida);',
			'2': 'background-color: var(--color-analizar);',
			'3': 'background-color: var(--color-cotizar);',
			'4': 'background-color: var(--color-ganada);',
			'5': 'background-color: var(--color-enviar);',
			'6': 'background-color: var(--color-finalizar); color: white;'
		};
		return colorMap[event?.fase] || 'background-color: var(--color-prospecto);';
	});

	function select() {
		console.log('selected', event);
		selectedEvent.set({ ...event });
	}
</script>

<button
	style={style}
	class={$appState.calendarCards ? 'max' : ''}
	use:draggable={{ data: event.id, enabled: isDndEnabled }}
	onclick={select}
>
	{#if $appState.calendarCards}
		<header>
			<b>{razon_social}</b>
		</header>

		<div class="meta">
			<span>{agente}</span>
			<span>{event?.inicio}</span>
		</div>

		<p class="motivo">{event?.motivo}</p>
	{:else}
		<div class="meta-min">
			<span class="meta-item">{agente}</span>
			<span class="meta-item">{event?.motivo}</span>
		</div>
	{/if}
</button>

<style>
	button {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		width: 100%;
		border: 1px solid var(--color-muted);
		border-radius: var(--a);
		padding: var(--a);
		cursor: pointer;
		text-align: left;
		height: 100%;
		overflow: hidden;
		backdrop-filter: blur(16px);
	}

	header {
		flex-grow: 1;
	}
	.meta {
		display: flex;
		gap: var(--a);
		font-size: 0.75rem;
		opacity: 0.8;
	}
	.meta-min {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		text-align: left;
	}
	.meta-item {
		flex-grow: 1;
	}
	.motivo {
		font-size: 0.8rem;
		opacity: 0.9;
	}
	.max {
		overflow: visible;
		min-height: fit-content;
	}
</style>