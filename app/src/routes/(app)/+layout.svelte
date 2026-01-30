<script lang="ts">
	import FormModalCliente from '$lib/components/FormModalCliente.svelte';
	import FormModalOportunidad from '$lib/components/FormModalOportunidad.svelte';
	import NavButton from '$lib/components/NavButton.svelte';
	import { profile } from '$lib/stores/profileStore.svelte.js';
	import { selectedEvent } from '$lib/stores/selectedEvent.js';

	let { children, data } = $props();
	profile.set(data.profile);
</script>

<nav class="nav-container">
	<NavButton />
</nav>

<div class="page-container">
	{@render children()}
</div>

<FormModalOportunidad {data}/>
<FormModalCliente />

<style>
	.nav-container {
		position: fixed;
		left: var(--a);
		top: 0;
		z-index: 999;
	}
</style>
