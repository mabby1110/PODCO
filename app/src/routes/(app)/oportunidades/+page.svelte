<script lang="ts">
	import { slide } from 'svelte/transition';
	import OpList from '$lib/components/Oportunidad/OpList.svelte';

	import CardOportunidad from '$lib/components/Oportunidad/CardOportunidad.svelte';

	import { selectedOp } from '$lib/stores/selectedOp.js';
	import { filterStore } from '$lib/stores/filterStore.svelte.js';
	import { filtrarConsecutivo } from '$lib/utils/util.js';

	let { data } = $props();
	const events = $derived(
		filterStore.atributo !== ''
			? filtrarConsecutivo(filterStore.atributo, 'id_agente', data.oportunidades)
			: data.oportunidades
	);
</script>

<div class="page-content">
	<section in:slide>
		<OpList oportunidades={events} />
	</section>
</div>

<style>
	.page-content {
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
