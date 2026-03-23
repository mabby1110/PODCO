<script lang="ts">
	import { slide } from 'svelte/transition';
	import OpList from '$lib/components/Oportunidad/OpList.svelte';

	import CardOportunidad from '$lib/components/Oportunidad/CardOportunidad.svelte';

	import { selectedOp } from '$lib/stores/selectedOp.js';

	let { data } = $props();
</script>

<div class="page-content">
	{#if $selectedOp}
		<section class="selected" in:slide>
			<CardOportunidad />
		</section>
	{:else}
		<section in:slide>
			<OpList oportunidades={data.oportunidades} />
		</section>
	{/if}
</div>

<style>
	.page-content {
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
