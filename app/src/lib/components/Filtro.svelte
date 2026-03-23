<script lang="ts" generics="T">
	// Tipos para estructurar los filtros
	type FilterAction = 'asc' | 'desc' | 'contains';

	type ColumnDef = {
		key: string; // El key en el objeto (ej. 'motivo', 'agente.nombre')
		label: string; // El nombre a mostrar (ej. 'Motivo', 'Agente')
	};

	type ActiveFilter = {
		id: number;
		column: ColumnDef;
		action: FilterAction;
		value: string;
	};

	// Props del componente
	let {
		items,
		columns,
		filteredItems = $bindable()
	} = $props<{
		items: T[];
		columns: ColumnDef[];
		filteredItems?: T[];
	}>();

	// Estado interno
	let show = $state(false);
	let activeFilters = $state<ActiveFilter[]>([]);
	let selectedColumnKey = $state<string>(columns[0]?.key || '');
	let selectedAction = $state<FilterAction>('contains');
	let inputValue = $state<string>('');
	let filterIdCounter = $state(0);

	// Helper para obtener valores anidados (por si necesitas filtrar por 'agente.nombre')
	const getNestedValue = (obj: any, path: string) => {
		return path.split('.').reduce((acc, part) => acc && acc[part], obj);
	};

	// Agregar un nuevo filtro a la pila
	function addFilter() {
		const column = columns.find((c) => c.key === selectedColumnKey);
		if (!column) return;
		if (selectedAction === 'contains' && !inputValue.trim()) return;

		activeFilters = [
			...activeFilters,
			{
				id: filterIdCounter++,
				column,
				action: selectedAction,
				value: inputValue.trim().toLowerCase()
			}
		];

		// Limpiar el input después de agregar
		inputValue = '';
	}

	function removeFilter(id: number) {
		activeFilters = activeFilters.filter((f) => f.id !== id);
	}

	// Efecto derivado que aplica la lógica de filtrado y ordenamiento
	$effect(() => {
		let result = [...items]; // Hacemos una copia para no mutar el original

		// 1. Primero aplicamos todos los filtros de búsqueda ('contains')
		const searchFilters = activeFilters.filter((f) => f.action === 'contains');
		if (searchFilters.length > 0) {
			result = result.filter((item) => {
				// Debe cumplir con TODOS los filtros acumulados (AND)
				return searchFilters.every((f) => {
					const val = getNestedValue(item, f.column.key);
					return String(val || '')
						.toLowerCase()
						.includes(f.value);
				});
			});
		}

		// 2. Luego aplicamos los ordenamientos ('asc' o 'desc')
		const sortFilters = activeFilters.filter((f) => f.action !== 'contains');
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

		// Actualizamos el prop bindeable
		filteredItems = result;
	});
</script>

{#if show}
	<button class="close-btn" type="button" onclick={() => (show = false)}>x</button>

	<select bind:value={selectedColumnKey}>
		{#each columns as col}
			<option value={col.key}>{col.label}</option>
		{/each}
	</select>

	<select bind:value={selectedAction}>
		<option value="contains">Contiene (Texto)</option>
		<option value="asc">Orden Ascendente</option>
		<option value="desc">Orden Descendente</option>
	</select>

	{#if selectedAction === 'contains'}
		<input
			type="text"
			bind:value={inputValue}
			placeholder="Escribe la palabra clave..."
			onkeydown={(e) => e.key === 'Enter' && addFilter()}
		/>
	{/if}

	<button class="butter" type="button" onclick={addFilter}>Agregar</button>

	{#if activeFilters.length > 0}
		<div class="active-filters">
			{#each activeFilters as filter (filter.id)}
				<button class="chip butter" onclick={() => removeFilter(filter.id)}>
					{filter.column.label}
					{#if filter.action === 'contains'}
						contiene "{filter.value}"
					{:else}
						({filter.action})
					{/if}
					<p class="close-chip">×</p>
				</button>
			{/each}
		</div>
	{/if}
{:else}
	<button class="butter" onclick={() => (show = true)}>Agregar Filtro</button>
{/if}

<style>
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
