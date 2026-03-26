<script lang="ts" generics="T">
	import {
		globalFilterStore,
		type ColumnDef,
		type FilterAction
	} from '$lib/stores/globalFilterStore.svelte';

	let {
		items,
		columns,
		filteredItems = $bindable()
	} = $props<{
		items: T[];
		columns: ColumnDef[];
		filteredItems?: T[];
	}>();

	// Estado local solo para los inputs de la UI
	let show = $state(false);
	let selectedColumnKey = $derived<string>(columns[0]?.key || '');
	let selectedAction = $state<FilterAction>('asc');
	let inputValue = $state<string>('');
	let filterCount = $derived(globalFilterStore.activeFilters.length);
	const getNestedValue = (obj: any, path: string) => {
		return path.split('.').reduce((acc, part) => acc && acc[part], obj);
	};

	function handleAdd() {
		const column = columns.find((c:any) => c.key === selectedColumnKey);
		if (!column) return;
		if (selectedAction === 'contains' && !inputValue.trim()) return;

		// Llamamos al método del store
		globalFilterStore.addFilter(column, selectedAction, inputValue.trim().toLowerCase());

		inputValue = '';
	}

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
	<div class="panel">
		<button class="butter" type="button" onclick={() => (show = false)}>ocultar</button>

		<select bind:value={selectedColumnKey}>
			{#each columns as col}
				<option value={col.key}>{col.label}</option>
			{/each}
		</select>

		<select bind:value={selectedAction}>
			<option value="asc">Orden Ascendente</option>
			<option value="desc">Orden Descendente</option>
			<option value="contains">Contiene (Texto)</option>
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
{:else}
	<button class="butter" onclick={() => (show = true)}
		>+Filtros {filterCount > 0 ? `(${filterCount})` : ''}</button
	>
{/if}

<style>
	.panel{
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
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
