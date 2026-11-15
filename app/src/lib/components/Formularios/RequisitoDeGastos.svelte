<!-- src/lib/components/ConstructorJson.svelte -->
<script lang="ts">
	import { profile } from '$lib/stores/profileStore.svelte';

	type Gasto = {
		concepto: string;
		monto: number;
		observaciones: string | null;
	};

	let {
		requisito_gasto,
		llaves = [],
		name = 'requisito_gasto'
	}: { requisito_gasto?: Gasto[] | null; llaves?: string[]; name?: string } = $props();

	// --- Estado ---
	let filas = $state<Gasto[]>(requisito_gasto || []);
	let llave = $state('');
	let especificar = $state(''); // solo cuando la llave es "otro"
	let monto = $state<number | null>(null);
	let observaciones = $state('');

	// --- Derivados ---
	let esOtro = $derived(llave === 'otro');
	let concepto = $derived(esOtro ? especificar.trim() : llave);
	let valido = $derived(concepto !== '' && monto !== null && monto > 0);
	let total = $derived(filas.reduce((suma, f) => suma + f.monto, 0));
	let json = $derived(JSON.stringify(filas));
	let preview = $derived(JSON.stringify(filas, null, 2));

	const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

	// --- Acciones ---
	function agregar() {
		if (!valido || monto === null) return;

		filas.push({
			concepto,
			monto,
			observaciones: observaciones.trim() || null
		});
		console.log(filas);
		llave = '';
		especificar = '';
		monto = null;
		observaciones = '';
	}

	function quitar(i: number) {
		filas.splice(i, 1);
	}

	function limpiar() {
		filas = [];
	}

	// Evita que Enter envíe el formulario padre
	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			agregar();
		}
	}
</script>

<div class="constructor-json">
	<div class="fila">
		<select aria-label="Tipo de gasto" bind:value={llave}>
			<option value="" disabled>Tipo de gasto…</option>
			{#each llaves as l (l)}
				<option value={l}>{l}</option>
			{/each}
		</select>

		{#if esOtro}
			<input
				type="text"
				aria-label="Especificar gasto"
				placeholder="Especificar gasto"
				bind:value={especificar}
				onkeydown={onKeydown}
			/>
		{/if}

		<input
			type="number"
			min="0"
			step="0.01"
			aria-label="Monto"
			placeholder="Cantidad en pesos MXN"
			bind:value={monto}
			onkeydown={onKeydown}
		/>

		<input
			type="text"
			aria-label="Observaciones"
			placeholder="Observaciones (opcional)"
			bind:value={observaciones}
			onkeydown={onKeydown}
		/>

		<button class="butter" type="button" onclick={agregar} disabled={!valido}>Agregar</button>
	</div>

	{#if filas.length}
		<div class="lista-gastos">
			{#each filas as fila, i (i)}
				<div class="fila">
					{#if $profile?.isAdmin}
						<button
							class="jelly rojo accion"
							type="button"
							onclick={() => quitar(i)}
							aria-label="Quitar {fila.concepto}"
						>
							✕
						</button>
					{/if}
					<strong>{fila.concepto}</strong>: {pesos.format(fila.monto)}
					{#if fila.observaciones}
						<small>({fila.observaciones})</small>
					{/if}
				</div>
			{/each}
		</div>
		<div class="resumen">
			<button class="butter" type="button" onclick={limpiar}>Limpiar todo</button>
			<h3>Total: {pesos.format(total)}</h3>
		</div>
	{/if}

	<!-- Se envía con el formulario padre -->
	<input type="hidden" {name} value={json} />

	<!-- <pre style="font-size: smaller">{preview}</pre> -->
</div>

<style>
	.fila {
		display: flex;
		justify-content: flex-start;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.lista-gastos {
		padding: var(--a);
	}
	.resumen {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}
</style>
