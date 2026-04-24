<script lang="ts">
	import {
		globalFilterStore,
		type ColumnDef,
		type FilterAction
	} from '$lib/stores/globalFilterStore.svelte';
	import { selectedGroupStore } from '$lib/stores/groupFilter.svelte';
	import { slide } from 'svelte/transition';
	import FiltroAgente from './FiltroAgente.svelte';
	import Select from './Select.svelte';

	let {
		columns,
		agrupaciones,
		calendar = false
	} = $props<{
		columns: ColumnDef[];
		agrupaciones: any;
		calendar?: boolean;
	}>();

	// UI State
	let selectedColumnKey = $state<string>(columns[0]?.key || '');
	let selectedAction = $state<FilterAction>('contains');
	let inputValue = $state<string>('');
	let show = $state(false);

	// Derived from stores
	let filterCount = $derived(globalFilterStore.activeFilters.length);

	function handleAdd() {
		const column = columns.find((c: any) => c.key === selectedColumnKey);
		if (!column) return;
		if (selectedAction === 'contains' && !inputValue.trim()) return;

		globalFilterStore.addFilter(column, selectedAction, inputValue.trim().toLowerCase());
		inputValue = '';
	}
</script>

{#if show}
	<div class="filter-container" in:slide>
		<div class="panel">
			<button class="close" type="button" onclick={() => (show = false)}>x</button>
			<div class="filter-options">
				<span>Agrupar</span>
				<div class="options">
					<FiltroAgente />
					{#if !calendar}
						<Select
							options={agrupaciones}
							defaultOption="Agrupar todos"
							bind:selected={selectedGroupStore.selectedGroup}
						/>
					{/if}
				</div>
			</div>

			{#if !calendar}
				<div class="filter-options">
					<span>Filtrar</span>
					<div class="options">
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
				</div>
			{/if}

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
							<span class="close-chip">×</span>
						</button>
					{/each}

					{#if globalFilterStore.activeFilters.length > 1}
						<button class="chop butter" onclick={() => globalFilterStore.clearFilters()}>
							Limpiar todo
						</button>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{:else}
	<button class="butter" onclick={() => (show = true)}>
		+Filtros {filterCount > 0 ? `(${filterCount})` : ''}
	</button>
{/if}

<style>
	.filter-container {
		width: 100%;
	}
	.filter-options {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
	.filter-options span {
		width: 100%;
		font-size: smaller;
		color: var(--color-muted);
	}
	.options {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
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
		gap: var(--a);
		width: 100%;
	}
	.chop {
		background-color: var(--color-error);
		padding: 4px var(--a);
		border-radius: 16px;
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	.close-chip {
		font-weight: bold;
		padding: 0 4px;
	}
	.chip:hover {
		background-color: var(--color-error);
	}
</style>
