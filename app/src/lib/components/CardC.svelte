<script lang="ts">
	let { children } = $props();
</script>

<button>
	{#if children}
		{@render children()}
	{:else}
		<p>fallback content</p>
	{/if}
</button>

<style>
	button {
		width: 100%;
		height: 100%;
		border: none;
		cursor: pointer;
		transition: background-color 0.2s ease;
		overflow: auto;
		display: flex;
		background-color: var(--color-liquidGlazz);
		box-shadow: 8px 0 8px 6px rgba(0, 0, 0, 0.2);
	}
</style>
