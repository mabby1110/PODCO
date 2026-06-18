<script lang="ts">
	import { page } from '$app/state';
	import { fases } from '$lib';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { formatDateFull, parseDateTimeLocal } from '$lib/utils/agenda';
	import { formatCurrency, getStyleForPhase } from '$lib/utils/util';
	import ListPreview from '../ListPreview.svelte';
	import DocListPreview from './DocListPreview.svelte';

	let { event } = $props();
</script>

<DocListPreview href="/oportunidades/{event.id}">
	{#snippet header()}
		<p>{event?.titulo}</p>
	{/snippet}
	{#snippet meta()}
		<p>{formatCurrency(event.total, 'USD')}</p>
		<p>{formatDateFull(parseDateTimeLocal(event.fecha_creacion))}</p>
	{/snippet}
	{#snippet content()}
		{#if event?.preview}
			<div class="brief">
				<iframe
					src={event.preview}
					class="iframe"
					title="Descripción del documento"
					loading="lazy"
					height="100%"
				></iframe>
			</div>
		{/if}
	{/snippet}

	<!-- {#snippet meta()}
		<p class="id">{eventData?.id}</p>
		<p>{eventData?.agente?.nombre}</p>
		<p>{eventData?.inicio}</p>
	{/snippet} -->
</DocListPreview>

<style>
	.brief {
		height: 60vh;
	}
</style>
