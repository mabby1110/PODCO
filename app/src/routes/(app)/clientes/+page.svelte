<script lang="ts">
	import { slide } from 'svelte/transition';
	import ClientList from '$lib/components/Cliente/ClientList.svelte';
	import { filterStore } from '$lib/stores/filterStore.svelte.js';
	import { filtrarConsecutivo } from '$lib/utils/util.js';

	let { data } = $props();
	const events = $derived(
		filterStore.atributo !== ''
			? filtrarConsecutivo(filterStore.atributo, 'id_agente', data.clientes)
			: data.clientes
	);
</script>

<div class="page-content">
	<ClientList clientes={events} />
</div>

<style>
	.page-content {
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
