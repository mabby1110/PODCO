<script lang="ts">
	import { slide } from 'svelte/transition';
	import ClientList from '$lib/components/Cliente/ClientList.svelte';

	let { data } = $props();
</script>

<div class="page-content">
	<section in:slide>
		<ClientList clients={data.clientes} agentes={data.agentes} />
	</section>
</div>

<style>
	.page-content {
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
	section {
		flex-grow: 1;
		overflow: auto;
		display: flex;
		flex-direction: column;
		min-height: var(--h);
	}
	.selected {
		max-height: 90vh;
		height: 100%;
	}
</style>
