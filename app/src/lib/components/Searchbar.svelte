<script lang="ts">
	import { slide } from "svelte/transition";

	interface DataItem {
		[key: string]: string | number | null | undefined;
	}

	let {
		data = [],
		selectedDataItem = $bindable(null),
		keyColumns = ['motivo']
	}: {
		data: DataItem[];
		selectedDataItem?: DataItem | null;
		keyColumns: [string] | null;
	} = $props();

	const eventList = $derived(data?.length ? data : []);
	let keyword = $state('');

	let filteredData = $derived.by(() => {
		const searchTerm = keyword.toLowerCase().trim();
		if (searchTerm === '') {
			return eventList;
		}

		return eventList.filter((item) => {
			return keyColumns.some((column) => {
				const value = item[column];
				if (value === null || value === undefined) return false;
				return String(value).toLowerCase().includes(searchTerm);
			});
		});
	});

	function selectItem(item: DataItem) {
		selectedDataItem = item;
		console.log('Item seleccionado:', item);
	}
</script>

<div class="container">
	<div class="search-input butter">
		<input type="text" bind:value={keyword} placeholder="Buscar..." required/>
	</div>
	{#if keyword}
		<div class="results" transition:slide>
			{#if filteredData.length > 0}
				{#each filteredData as item (item.id)}
					<button type="button" class="search-result" onclick={() => selectItem(item)}>
						<span class="meta">{item.razon_social}</span>
					</button>
				{/each}
			{:else}
				<div class="no-results">No se encontraron resultados</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.container {
		width: 100%;
		display: flex;
		flex-direction: column;
	}
	.search-input {
		flex-grow: 1;
		padding: 0;
		overflow: hidden;
	}
	.search-input input {
		width: 100%;
		height: 100%;
		border: none;
		border-radius: var(--a);
		padding: 0 var(--a);
	}
	.results {
		padding: var(--a);
		display: flex;
		flex-direction: column;
		gap: var(--a);
		max-height: var(--g);
		overflow: auto;
	}
	.search-result {
		background: none;
		border: 1px solid var(--border-color, #ddd);
		padding: var(--a);
		border-radius: var(--a);
		cursor: pointer;
		text-align: left;
		transition: background 0.2s;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.search-result:hover {
		background: var(--hover-bg, #f5f5f5);
	}
	.meta {
		font-size: 0.85em;
		color: var(--text-secondary, #666);
	}
	.no-results {
		padding: var(--a);
		text-align: center;
		color: var(--text-secondary, #666);
	}
</style>
