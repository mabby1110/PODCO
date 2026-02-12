<script lang="ts">
	import ModalCliente from '$lib/components/ModalCliente.svelte';
	import ModalOportunidad from '$lib/components/ModalOportunidad.svelte';
	import NavButton from '$lib/components/NavButton.svelte';
	import { profile } from '$lib/stores/profileStore.svelte.js';

	let { children, data } = $props();
	profile.set(data.profile);
</script>

<nav class="nav-container">
	<NavButton />
</nav>

<div class="page-container">
	{@render children()}
</div>

<ModalOportunidad {data} />
<ModalCliente {data} />

<style>
	.nav-container {
		position: fixed;
		left: var(--a);
		top: 0;
		z-index: 999;
	}
	/* .page-container {
		background-image: url('bombas.svg');
	} */
</style>
