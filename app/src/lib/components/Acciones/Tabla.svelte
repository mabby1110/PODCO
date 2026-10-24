<script lang="ts" generics="T extends Record<string, any>">
	import type { Snippet } from 'svelte';

	export type Columna<R = any> = {
		/** Clave del objeto (o identificador único si usas `valor`) */
		clave: string;
		/** Texto del encabezado. Por defecto, la clave */
		titulo?: string;
		/** Extrae el valor de la fila (para campos anidados, calculados, etc.) */
		valor?: (fila: R) => unknown;
	};

	/** Función que decide si una fila pasa el filtro de una columna */
	export type Filtro = (valor: unknown) => boolean;

	type Props = {
		/** Lista de objetos (ej. resultado de supabase) */
		datos: T[];
		/** Opcional: define/ordena/renombra columnas. Si no se pasa, se infieren de los datos */
		columnas?: Columna<T>[];
		/** Campo único para el {#each} key (ej. 'id') */
		claveFila?: string;
		/** Filtros activos por columna: { [clave]: (valor) => boolean }. Enlazable desde el padre */
		filtros?: Record<string, Filtro>;
		/** Contenido personalizado del encabezado (aquí irá el menú de filtro tipo Excel) */
		encabezado?: Snippet<[columna: Columna<T>, ctx: { valoresUnicos: unknown[] }]>;
		/** Contenido personalizado de una celda */
		celda?: Snippet<[valor: unknown, fila: T, columna: Columna<T>]>;
	};

	let {
		datos,
		columnas,
		claveFila = 'id',
		filtros = $bindable({}),
		encabezado,
		celda
	}: Props = $props();

	// Columnas: las provistas, o la unión de llaves de todas las filas (en orden de aparición)
	const cols = $derived.by<Columna<T>[]>(() => {
		if (columnas?.length) return columnas;
		const claves = new Set<string>();
		for (const fila of datos) for (const k of Object.keys(fila)) claves.add(k);
		return [...claves].map((clave) => ({ clave }));
	});

	function obtener(fila: T, col: Columna<T>): unknown {
		return col.valor ? col.valor(fila) : fila[col.clave];
	}

	function formatear(v: unknown): string {
		if (v === null || v === undefined) return '';
		if (typeof v === 'object') return JSON.stringify(v);
		return String(v);
	}

	// Pipeline de datos: datos -> filtrados  (luego se puede añadir -> ordenados)
	const filas = $derived.by(() => {
		const activos = cols.filter((c) => filtros[c.clave]);
		if (!activos.length) return datos;
		return datos.filter((fila) => activos.every((c) => filtros[c.clave](obtener(fila, c))));
	});

	// Valores únicos por columna (calculados bajo demanda, para listas tipo Excel)
	function valoresUnicos(col: Columna<T>): unknown[] {
		return [...new Set(datos.map((f) => obtener(f, col)))];
	}
</script>

<div class="tabla-contenedor honey">
	<table>
		<thead>
			<tr>
				{#each cols as col (col.clave)}
					<th>
						{#if encabezado}
							{@render encabezado(col, { valoresUnicos: valoresUnicos(col) })}
						{:else}
							{col.titulo ?? col.clave}
						{/if}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each filas as fila, i (fila[claveFila] ?? i)}
				<tr>
					{#each cols as col (col.clave)}
						{@const v = obtener(fila, col)}
						<td>
							{#if celda}
								{@render celda(v, fila, col)}
							{:else}
								{formatear(v)}
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	/* Solo lo necesario para scroll horizontal/vertical y encabezado fijo.
	   Define la altura desde el padre (ej. height / max-height en el contenedor). */
	.tabla-contenedor {
		overflow: auto;
		max-height: 100%;
		max-width: 100%;
	}
	table {
		border-collapse: separate;
		border-spacing: 0;
	}
	th {
		position: sticky;
		top: 0;
		background: Canvas;
	}
	th,
	td {
		white-space: nowrap;
        max-width: var(--g);
        overflow: hidden;
	}
</style>