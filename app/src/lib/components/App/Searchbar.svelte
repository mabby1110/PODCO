<script lang="ts">
	type Props = {
		label?: string;
		data: Record<string, any>[];
		lista?: any;
		keyColumns: string[];
		selectedItem?: Record<string, any> | null;
		lenght?: number;
		unique?: boolean;
		showResults?: boolean;
	};

	let {
		label,
		data,
		lista = $bindable([]),
		keyColumns,
		selectedItem = $bindable(null),
		lenght = $bindable(0),
		unique = $bindable(false),
		showResults = false
	}: Props = $props();

	let term = $state('');
	let visibleColumns = $state([...keyColumns]);

	let results = $derived(
		term.trim() === ''
			? []
			: data.filter((obj) => {
					const search = term.toLowerCase();
					return keyColumns.some((key) => matchTerm(obj[key], search));
				})
	);
	function matchTerm(value: any, search: string): boolean {
		if (value == null) return false;
		if (Array.isArray(value)) {
			return value.some((v) => matchTerm(v, search));
		}
		if (typeof value === 'object') {
			return Object.values(value).some((v) => matchTerm(v, search));
		}
		return String(value).toLowerCase().includes(search);
	}

	function hideColumn(col: string) {
		visibleColumns = visibleColumns.filter((c) => c !== col);
	}

	function resetColumns() {
		visibleColumns = [...keyColumns];
	}

	$effect(() => {
		if (selectedItem) {
			term = '';
		}
	});
	$effect(() => {
		lista = term.length > 0 ? results : data;
	});

	$effect(() => {
		lenght = results.length;
		unique = term.length > 0 && lenght === 0;
	});
</script>

{#if showResults}
	<div class="searchbar-container">
		{#if label}
			<h3>{label}</h3>
		{/if}
		{#if visibleColumns.length < keyColumns.length}
			<button class="reset-button" onclick={resetColumns}>Resetear Columnas</button>
		{/if}

		<input type="search" bind:value={term} placeholder="Buscar..." />

		{#if results.length > 0 && visibleColumns.length > 0}
			<div class="results" style="--col-count: {visibleColumns.length};">
				{#each visibleColumns as col}
					<button class="grid-header" onclick={() => hideColumn(col)}>
						{col}
					</button>
				{/each}

				{#each results as item}
					<button
						class="list-button"
						onclick={() => {
							selectedItem = item;
						}}
					>
						{#each visibleColumns as key}
							<div class="grid-cell">
								{#if Array.isArray(item[key])}
									{JSON.stringify(item[key])}
								{:else if typeof item[key] === 'object' && item[key] !== null}
									[Objeto]
								{:else}
									{item[key] ?? ''}
								{/if}
							</div>
						{/each}
					</button>
				{/each}
			</div>
		{/if}
	</div>
{:else}
	<input type="search" bind:value={term} placeholder="Buscar..." />
{/if}

<style>
	.searchbar-container {
		display: flex;
		flex-direction: column;
	}

	.reset-button {
		padding: 4px 8px;
		cursor: pointer;
	}

	.results {
		display: grid;
		grid-template-columns: repeat(var(--col-count), 1fr);
		width: 100%;
		max-height: 30vh;
		overflow-y: auto;
	}

	.grid-header {
		all: unset;
		box-sizing: border-box;
		font-weight: bold;
		text-align: left;
		padding: 8px 4px;
		border-bottom: 2px solid;
		position: sticky;
		top: 0;
		background-color: Canvas;
		z-index: 1;
		cursor: pointer;
	}

	.list-button {
		display: contents;
	}

	.grid-cell {
		padding: 8px 4px;
		text-align: left;
		border-bottom: 1px solid rgba(128, 128, 128, 0.2);
	}

	.list-button:hover .grid-cell {
		background-color: var(--color-contrast);
		cursor: pointer;
	}
</style>
