<script lang="ts">
	let { adjuntos } = $props<{ adjuntos: string }>();

	let expanded = $state(false);

	let docs = $derived(adjuntos ? JSON.parse(adjuntos) : []);

	function showMore() {
		expanded = true;
	}
</script>

<div class="adjuntos">
	<div class="grid" class:expanded={expanded}>
		{#each docs as doc}
			<iframe src={doc.preview} class="iframe" title="Documento"></iframe>
		{/each}
	</div>

	{#if !expanded && docs.length > 2}
		<button class="more" onclick={()=>expanded = true}>
			mostrar más
		</button>
        {:else}
		<button class="more" onclick={()=>expanded = false}>
			mostrar menos
		</button>
	{/if}
</div>

<style>
	.adjuntos {
		display: flex;
		flex-direction: column;
		gap: var(--b);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: var(--b);
		max-height: 35vh;
		overflow: hidden;
	}

	.grid.expanded {
		max-height: 50vh;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.iframe {
		width: 100%;
		height: 40vh;
		pointer-events: none;
	}

	.more {
		align-self: center;
		background: none;
		border: none;
		padding: 0;
		font-size: 0.9rem;
		opacity: 0.6;
		cursor: pointer;
	}

	.more:hover {
		opacity: 1;
	}
</style>