<!-- Table.svelte -->
<script lang="ts" generics="T extends Record<string, unknown>">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Arreglo de objetos tal como lo devuelve Supabase */
		item: T[];
		/** Ancho mínimo de cada columna en px. Si no caben, se envuelven a la siguiente línea. */
		columnWidth?: number;
		/** Render opcional de celda */
		cell?: Snippet<[value: unknown, row: T, key: string]>;
	}

	let { item, columnWidth = 120, cell }: Props = $props();

	// Los encabezados salen de las llaves del JSON (unión de todas las filas, en orden de aparición)
	const keys = $derived([...new Set(item.flatMap((row) => Object.keys(row)))]);

	function format(value: unknown): string {
		if (value === null || value === undefined) return '';
		if (typeof value === 'object') return JSON.stringify(value);
		return String(value);
	}
</script>

<div class="table" style:--col-width="{columnWidth}px" role="table">
	<div class="row header" role="row">
		{#each keys as key (key)}
			<div class="cell" role="columnheader">{key}</div>
		{/each}
	</div>

	{#each item as row, i (i)}
		<div class="row" role="row">
			{#each keys as key (key)}
				<div class="cell" role="cell">
					{#if cell}
						{@render cell(row[key], row, key)}
					{:else}
						{format(row[key])}
					{/if}
				</div>
			{/each}
		</div>
	{/each}
</div>

<style>
	/* Recorta el borde derecho/inferior de las celdas: el borde exterior lo pone el padre */
	.table {
		width: 100%;
		overflow: hidden;
		font-size: 0.875rem;
	}

	.row {
		display: grid;
		/* Sin overflow: si no caben más columnas, pasan a la línea siguiente */
		grid-template-columns: repeat(auto-fill, minmax(var(--col-width), 1fr));
		margin-right: -1px;
	}

	.row:last-child {
		margin-bottom: -1px;
	}

	.cell {
		min-width: 0;
		padding: 0.35rem 0.6rem;
		border-right: 1px solid var(--table-border, #d4d4d8);
		border-bottom: 1px solid var(--table-border, #d4d4d8);
		overflow-wrap: anywhere;
	}

	.header .cell {
		font-weight: 700;
	}
</style>