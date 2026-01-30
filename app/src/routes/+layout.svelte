<script lang="ts">
	import bms from '$lib/assets/bms-logo.svg';
	import '$lib/global.css';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={bms} />
</svelte:head>

{@render children()}
