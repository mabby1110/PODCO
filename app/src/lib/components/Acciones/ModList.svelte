<script lang="ts">
	import {
		StoreModList,
		type FilterRule,
		type SortRule,
		type Operator
	} from '$lib/stores/StoreModList.svelte';

	type FieldType = 'string' | 'number' | 'date' | 'object';

	let {
		route,
		columnasDinamicas,
		agrupar,
		ordenar
	}: {
		route: string;
		columnasDinamicas: { key: string; label: string; type: FieldType }[];
		agrupar?: boolean;
		ordenar?: boolean;
	} = $props();

	let estado = $derived(StoreModList.get(route));

	const operadoresMap: Record<FieldType, { valor: Operator; label: string }[]> = {
		string: [
			{ valor: 'eq', label: '=' },
			{ valor: 'neq', label: '!=' },
			{ valor: 'contains', label: 'Contiene' }
		],
		number: [
			{ valor: 'eq', label: '=' },
			{ valor: 'neq', label: '!=' },
			{ valor: 'gt', label: '>' },
			{ valor: 'lt', label: '<' }
		],
		date: [
			{ valor: 'eq', label: '=' },
			{ valor: 'neq', label: '!=' },
			{ valor: 'gt', label: '>' },
			{ valor: 'lt', label: '<' }
		],
		object: [
			{ valor: 'eq', label: '=' },
			{ valor: 'neq', label: '!=' },
			{ valor: 'contains', label: 'Contiene' }
		]
	};

	const inputTypeMap: Record<FieldType, string> = {
		string: 'text',
		number: 'number',
		date: 'datetime-local',
		object: 'text'
	};

	function getCampoDef(key: string) {
		return columnasDinamicas.find((c) => c.key === key) || columnasDinamicas[0];
	}

	function agregarFiltro() {
		const defaultCampo = columnasDinamicas[0];
		if (!defaultCampo) return;

		const filters = [
			...estado.filters,
			{ field: defaultCampo.key, operator: operadoresMap[defaultCampo.type][0].valor, value: '' }
		];
		StoreModList.update(route, { filters });
	}

	function actualizarFiltro(index: number, rule: FilterRule) {
		const filters = [...estado.filters];
		filters[index] = rule;
		StoreModList.update(route, { filters });
	}

	function cambiarCampoFiltro(index: number, newField: string) {
		const campoDef = getCampoDef(newField);
		const currentRule = estado.filters[index];

		const operator = operadoresMap[campoDef.type].some((op) => op.valor === currentRule.operator)
			? currentRule.operator
			: operadoresMap[campoDef.type][0].valor;

		actualizarFiltro(index, {
			...currentRule,
			field: newField,
			operator,
			value: ''
		});
	}

	function eliminarFiltro(index: number) {
		const filters = estado.filters.filter((_, i) => i !== index);
		StoreModList.update(route, { filters });
	}

	function agregarOrden() {
		const defaultCampo = columnasDinamicas[0];
		if (!defaultCampo) return;

		const sorts = [...estado.sorts, { field: defaultCampo.key, direction: 'asc' as const }];
		StoreModList.update(route, { sorts });
	}

	function actualizarOrden(index: number, rule: SortRule) {
		const sorts = [...estado.sorts];
		sorts[index] = rule;
		StoreModList.update(route, { sorts });
	}

	function eliminarOrden(index: number) {
		const sorts = estado.sorts.filter((_, i) => i !== index);
		StoreModList.update(route, { sorts });
	}

	function actualizarAgrupacion(field: string | null) {
		StoreModList.update(route, { groupBy: field });
	}
</script>

<div class="mod-list">
	{#if agrupar}
		<div>
			<select
				value={estado.groupBy ?? ''}
				onchange={(e) => actualizarAgrupacion(e.currentTarget.value || null)}
			>
				<option value="">Sin Agrupación</option>
				{#each columnasDinamicas as campo}
					<option value={campo.key}>{campo.label}</option>
				{/each}
			</select>
		</div>
	{/if}
	{#if ordenar}
		<div class="accion">
			<button class="butter" onclick={agregarOrden}>+ Orden</button>
			{#each estado.sorts as orden, i}
				<div class="mod">
					<button class="butter chile" onclick={() => eliminarOrden(i)}>X</button>
					<select
						value={orden.field}
						onchange={(e) => actualizarOrden(i, { ...orden, field: e.currentTarget.value })}
					>
						{#each columnasDinamicas as campo}
							<option value={campo.key}>{campo.label}</option>
						{/each}
					</select>
					<select
						value={orden.direction}
						onchange={(e) =>
							actualizarOrden(i, { ...orden, direction: e.currentTarget.value as 'asc' | 'desc' })}
					>
						<option value="asc">Asc</option>
						<option value="desc">Desc</option>
					</select>
				</div>
			{/each}
		</div>
	{/if}

	<div class="accion">
		<button class="butter" onclick={agregarFiltro}>+ Filtro</button>
		{#each estado.filters as filtro, i}
			{@const campoDef = getCampoDef(filtro.field)}
			<div class="mod">
				<button class="butter chile" onclick={() => eliminarFiltro(i)}>X</button>
				<select value={filtro.field} onchange={(e) => cambiarCampoFiltro(i, e.currentTarget.value)}>
					{#each columnasDinamicas as campo}
						<option value={campo.key}>{campo.label}</option>
					{/each}
				</select>
				<select
					value={filtro.operator}
					onchange={(e) =>
						actualizarFiltro(i, { ...filtro, operator: e.currentTarget.value as Operator })}
				>
					{#each operadoresMap[campoDef.type] as op}
						<option value={op.valor}>{op.label}</option>
					{/each}
				</select>
				<input
					type={inputTypeMap[campoDef.type]}
					value={filtro.value}
					oninput={(e) => actualizarFiltro(i, { ...filtro, value: e.currentTarget.value })}
				/>
			</div>
		{/each}
	</div>
</div>

<style>
	.mod-list {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
	.accion {
		display: flex;
		flex-wrap: wrap;
		flex-direction: column;
	}
	.mod {
		display: flex;
	}
</style>
