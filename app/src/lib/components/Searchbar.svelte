<script lang="ts">
	import { slide } from 'svelte/transition';
	import FormNewClient from './Cliente/FormNewClient.svelte';
	import FormConditionalInput from './FormConditionalInput.svelte';

	interface DataItem {
		[key: string]: string | number | null | undefined;
	}

	let {
		data = [],
		keyColumns = ['motivo'],
		selectedItem = $bindable(),
		newCLient = $bindable()
	}: {
		data: DataItem[];
		keyColumns: string[];
		selectedItem: DataItem | null;
		newCLient: boolean;
	} = $props();

	let keyword = $state('');
	let isDuplicate = $state(false);
	let isOpen = $state(false);

	const eventList = $derived(data?.length ? data : []);
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

	function selectItem(item: any) {
		selectedItem = item;
		keyword = '';
	}
	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = target.value;

		// Elimina espacios al inicio preservando la posición del cursor
		if (value.startsWith(' ')) {
			const cleaned = value.trimStart();
			target.value = cleaned;
			keyword = cleaned;
		} else {
			keyword = value;
		}
	}
	$effect(() => {
		if(!isDuplicate) {
			newCLient = isOpen;
		}
	});
</script>

<div class="search-container">
	{#if selectedItem}
		<label for="id_cliente">
			<h3>Cliente</h3>
			<div class="selected-client">
				<button
					type="button"
					class="close-btn"
					onclick={(e) => {
						e.stopPropagation();
						selectedItem = null;
					}}>✕</button
				>
				<p>{selectedItem?.razon_social}</p>
			</div>
		</label>
	{:else}
		<label>
			<span>Buscar Cliente</span>
			{#if isOpen}
				<FormNewClient bind:isDuplicate />
			{:else}
				<input
					class="butter"
					type="text"
					value={keyword}
					oninput={handleInput}
					placeholder="Buscar..."
					required
				/>
				{#if keyword}
					<div class="results" transition:slide>
						{#if filteredData.length > 0}
							{#each filteredData as item (item.id)}
								<button
									type="button"
									class="search-result"
									onclick={(e) => {
										e.stopPropagation();
										selectItem(item);
									}}
								>
									<span class="meta">{item.razon_social}</span>
								</button>
							{/each}
						{:else}
							<div class="no-results">No se encontraron resultados</div>
						{/if}
					</div>
				{/if}
			{/if}
			<FormConditionalInput titleOpen="Agregar nuevo" bind:isOpen />
		</label>
	{/if}
</div>

<style>
	.search-container {
		width: 100%;
		max-width: var(--j);
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
		display: flex;
		flex-direction: column;
		gap: 4px;
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
	.selected-client {
		display: flex;
		gap: var(--a);
		align-items: center;
	}
</style>
