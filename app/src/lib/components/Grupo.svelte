<script>
	let { agrupacion, showByDefault=false, children } = $props();
	let show = $derived(showByDefault);
</script>

<button class="group-header" onclick={() => (show = !show)}>
	<h3 class="dia-header">{agrupacion.grupo}</h3>
</button>
<hr>
{#if show}
	{@render children()}
{/if}

<style>
	.group-header {
		all: unset;
		padding: var(--a);
		border-radius: var(--a);
	}
	.group-header:hover {
		cursor: pointer;
		opacity: 60%;
		background-color: var(--color-highlight);
	}
</style>
