<script lang="ts">
	import { filtroStore, type ColumnDef, type FilterAction } from '$lib/stores/filtroStore.svelte';
	import { page } from '$app/stores';

	let { categorias, calendar = false } = $props<{
		categorias: ColumnDef[];
		calendar?: boolean;
	}>();

	let selectedColumnKey = $state<string>(categorias?.key || '');
	let selectedAction = $state('');
	let inputValue = $state<string>('');
	let show = $state(false);

	let currentRoute = $derived($page.url.pathname);
	let activeFilters = $derived(filtroStore.filtersByRoute[currentRoute] || []);
	let filterCount = $derived(activeFilters.length);

	function handleAdd() {
		const column = categorias.find((c: any) => c.key === selectedColumnKey);
		if (!column) return;
		if (selectedAction === 'contains' && !inputValue.trim()) return;

		const valueToAdd = selectedAction === 'contains' ? inputValue.trim().toLowerCase() : '';
		filtroStore.addFilter(currentRoute, column, selectedAction, valueToAdd);
		inputValue = '';
	}
	function handleKeyDown(event) {
		if (event.key === 'Escape') {
			show = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />
{#if show}
	<div class="filter-container">
		<div class="panel">
			<button class="close" type="button" onclick={() => (show = false)}>x</button>
			{#if !calendar}
				<div class="options">
					<select bind:value={selectedColumnKey}>
						<option value="" disabled>Campo</option>
						{#each categorias as col}
							<option value={col.key}>{col.label}</option>
						{/each}
					</select>

					<select bind:value={selectedAction}>
						<option value="" disabled>Condición</option>
						<option value="contains">Contiene</option>
						<option value="asc">Mas antiguo</option>
						<option value="desc">Mas reciente</option>
						<option value="isNull">Es nulo</option>
						<option value="hasData">Contiene datos</option>
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
					{#if activeFilters.length > 0}
						{#each activeFilters as filter (filter.id)}
							<button
								class="chip butter"
								onclick={() => filtroStore.removeFilter(currentRoute, filter.id)}
							>
								{filter.column.label}
								{#if filter.action === 'contains'}
									contiene "{filter.value}"
								{:else if filter.action === 'asc'}
									(Mas antiguo)
								{:else if filter.action === 'desc'}
									(Mas reciente)
								{:else if filter.action === 'isNull'}
									(Es nulo)
								{:else if filter.action === 'hasData'}
									(Con datos)
								{/if}
								<span class="close-chip">×</span>
							</button>
						{/each}

						{#if activeFilters.length > 1}
							<button class="chop butter" onclick={() => filtroStore.clearFilters(currentRoute)}>
								Limpiar todo
							</button>
						{/if}
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
		order: 1;
		width: 100%;
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
