<script lang="ts">
	import bms from '$lib/assets/bms-logo.svg';
	import '$lib/global.css';
	import { profile } from '$lib/stores/profileStore.svelte.js';
	let { children, data } = $props();

	profile.set(data.profile);
	console.log($profile);
</script>

<svelte:head>
	<link rel="icon" href={bms} />
</svelte:head>

{@render children()}
