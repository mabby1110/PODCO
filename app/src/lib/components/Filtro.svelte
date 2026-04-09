<script lang="ts" generics="T">
	import {
		globalFilterStore,
		type ColumnDef,
		type FilterAction
	} from '$lib/stores/globalFilterStore.svelte';
	import { selectedGroupStore } from '$lib/stores/groupFilter.svelte';
	import FilterOpList from './FilterOpList.svelte';
	import Select from './Select.svelte';

	let selected = $state(selectedGroupStore.selectedGroup ?? '');
	let {
		items,
		columns,
		agrupaciones,
		filteredItems = $bindable()
	} = $props<{
		items: T[];
		columns: ColumnDef[];
		agrupaciones: any;
		filteredItems?: T[];
	}>();

	// Estado local solo para los inputs de la UI
	let selectedColumnKey = $derived<string>(columns[0]?.key || '');
	let selectedAction = $state<FilterAction>('contains');
	let inputValue = $state<string>('');
	let filterCount = $derived(globalFilterStore.activeFilters.length);
	let show = $state(true);

	const getNestedValue = (obj: any, path: string) => {
		return path.split('.').reduce((acc, part) => acc && acc[part], obj);
	};

	function handleAdd() {
		const column = columns.find((c: any) => c.key === selectedColumnKey);
		if (!column) return;
		if (selectedAction === 'contains' && !inputValue.trim()) return;

		// Llamamos al método del store
		globalFilterStore.addFilter(column, selectedAction, inputValue.trim().toLowerCase());

		inputValue = '';
	}

	$effect(() => {
		console.log('selected', selected);
		selectedGroupStore.selectedGroup = selected != '' ? selected : '';
	});
	// Efecto derivado que aplica la lógica de filtrado observando el store global
	$effect(() => {
		let result = [...items];

		// Accedemos a los filtros desde el store
		const filters = globalFilterStore.activeFilters;
		const searchFilters = filters.filter((f) => f.action === 'contains');
		if (searchFilters.length > 0) {
			result = result.filter((item) => {
				return searchFilters.every((f) => {
					const val = getNestedValue(item, f.column.key);
					return String(val || '')
						.toLowerCase()
						.includes(f.value);
				});
			});
		}

		const sortFilters = filters.filter((f) => f.action !== 'contains');
		if (sortFilters.length > 0) {
			result.sort((a, b) => {
				for (const f of sortFilters) {
					const valA = getNestedValue(a, f.column.key) || '';
					const valB = getNestedValue(b, f.column.key) || '';

					if (valA < valB) return f.action === 'asc' ? -1 : 1;
					if (valA > valB) return f.action === 'asc' ? 1 : -1;
				}
				return 0;
			});
		}

		filteredItems = result;
	});
</script>

{#if show}
	<div class="filter-container">
		<div class="panel">
			<div class="filter-options">
				<span>Agrupar</span>
				<button class="close" type="button" onclick={() => (show = false)}>x</button>
				<FilterOpList />
				<Select options={agrupaciones} defaultOption="Agrupar todos" bind:selected />
			</div>

			<div class="filter-options">
				<span>Filtrar</span>
				<select bind:value={selectedColumnKey}>
					{#each columns as col}
						<option value={col.key}>{col.label}</option>
					{/each}
				</select>

				<select bind:value={selectedAction}>
					<option value="contains">Contiene</option>
					<option value="asc">Asc</option>
					<option value="desc">Desc</option>
				</select>

				{#if selectedAction === 'contains'}
					<input
						type="text"
						bind:value={inputValue}
						placeholder="Escribe la palabra clave..."
						onkeydown={(e) => e.key === 'Enter' && handleAdd()}
					/>
				{/if}

				<button class="butter" type="button" onclick={handleAdd}>Agregar</button>
			</div>

			{#if globalFilterStore.activeFilters.length > 0}
				<div class="active-filters">
					{#each globalFilterStore.activeFilters as filter (filter.id)}
						<button class="chip butter" onclick={() => globalFilterStore.removeFilter(filter.id)}>
							{filter.column.label}
							{#if filter.action === 'contains'}
								contiene "{filter.value}"
							{:else}
								({filter.action})
							{/if}
							<p class="close-chip">×</p>
						</button>
					{/each}

					{#if globalFilterStore.activeFilters.length > 1}
						<button class="chop butter" onclick={() => globalFilterStore.clearFilters()}
							>Limpiar todo</button
						>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{:else}
	<button class="butter" onclick={() => (show = true)}
		>+Filtros {filterCount > 0 ? `(${filterCount})` : ''}</button
	>
{/if}

<style>
	.filter-container {
		width: 100%;
	}
	.filter-options {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
	}
	.filter-options span {
		width: 100%;
		font-size: smaller;
		color: var(--color-muted);
	}
	.panel {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		width: fit-content;
	}

	.active-filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.chip {
		background-color: var(--color-highlight);
		padding: 0.2rem 0.5rem;
		border-radius: 16px;
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	.chop {
		background-color: var(--color-error);
		padding: 0.2rem 0.5rem;
		border-radius: 16px;
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	.close-chip {
		background: none;
		border: none;
		color: #64748b;
		cursor: pointer;
		font-weight: bold;
		padding: 0 0.2rem;
	}
	.chip:hover {
		background-color: var(--color-error);
	}
</style>
