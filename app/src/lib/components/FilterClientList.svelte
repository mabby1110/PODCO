<script lang="ts">
	type SortField =
		| 'razon_social'
		| 'ubicacion'
		| 'tipo_prospeccion'
		| 'fecha_creacion'
		| 'oportunidades';
	type SortOrder = 'asc' | 'desc';

	let { sortField = $bindable(), sortOrder = $bindable() } = $props<{
		sortField: SortField;
		sortOrder: SortOrder;
	}>();

	function toggleSort(field: SortField) {
		if (sortField === field) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortOrder = 'asc';
		}
	}
</script>
<div class="filter-container">
	<button
		class="butter"
		class:active={sortField === 'razon_social'}
		onclick={() => toggleSort('razon_social')}
	>
		Razón Social {sortField === 'razon_social' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
	</button>
	<!-- <button
		class="butter"
		class:active={sortField === 'ubicacion'}
		onclick={() => toggleSort('ubicacion')}
	>
		Ubicación {sortField === 'ubicacion' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
	</button> -->
	<!-- <button
		class="butter"
		class:active={sortField === 'tipo_prospeccion'}
		onclick={() => toggleSort('tipo_prospeccion')}
	>
		Tipo Prospección {sortField === 'tipo_prospeccion' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
	</button> -->
	<button
		class="butter"
		class:active={sortField === 'fecha_creacion'}
		onclick={() => toggleSort('fecha_creacion')}
	>
		Fecha {sortField === 'fecha_creacion' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
	</button>
	<button
		class="butter"
		class:active={sortField === 'oportunidades'}
		onclick={() => toggleSort('oportunidades')}
	>
		Oportunidades {sortField === 'oportunidades' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
	</button>
</div>

<style>
	.filter-container {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
	}
	.butter.active {
		background-color: var(--color-contrast);
		color: white;
		border-color: var(--color-contrast);
	}

	.butter:hover {
		background-color: var(--color-highlight);
		color: black;
	}
</style>
