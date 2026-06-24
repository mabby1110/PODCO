<script>
	let { agrupacion, showByDefault = false, children } = $props();
	let show = $derived(showByDefault);
</script>

<button class="group-header" onclick={() => (show = !show)}>
	<h3 class="dia-header">{agrupacion.grupo} ({agrupacion.elementos.length})</h3>
</button>
<hr />
{#if show}
	<div class="group-list">
		{@render children()}
	</div>
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
	.group-list {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding: var(--a);
	}
</style>
