<script lang="ts">
	import { slide } from 'svelte/transition';
	import OpList from '$lib/components/Oportunidad/OpList.svelte';
	import { filterStore } from '$lib/stores/filterStore.svelte.js';
	import { filtrarConsecutivo } from '$lib/utils/util.js';
	import { page } from '$app/state';

	let { oportunidades } = $derived(page.data);
	const events = $derived(
		filterStore.atributo !== ''
			? filtrarConsecutivo(filterStore.atributo, 'id_agente', oportunidades)
			: oportunidades
	);
</script>

<div class="page-content">
	<OpList oportunidades={events} />
</div>

<style>
	.page-content {
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
