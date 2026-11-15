<!-- src/lib/components/ConstructorJson.svelte -->
<script lang="ts">
	type Tipo = 'text' | 'number' | 'boolean' | 'null';
	type Fila = Record<string, string | number | boolean | null>;

	let {
		llaves = [],
		tipos = [],
		name = 'json'
	}: { llaves?: string[]; tipos?: Tipo[]; name?: string } = $props();

	// --- Estado ---
	let filas = $state<Fila[]>([]);
	let llave = $state('');
	let seleccion = $state<Tipo | null>(null);
	let texto = $state('');
	let numero = $state<number | null>(null);
	let booleano = $state('true');

	// --- Derivados ---
	// Si no se envían tipos, el tipo es "text" y el select no se muestra
	let tipo = $derived<Tipo>(seleccion ?? tipos[0] ?? 'number');
	let mostrarTipo = $derived(tipos.length > 1);
	let json = $derived(JSON.stringify(filas));
	let preview = $derived(JSON.stringify(filas, null, 2));

	// --- Acciones ---
	function agregar() {
		if (!llave) return;

		let valor: string | number | boolean | null;
		switch (tipo) {
			case 'text':
				valor = texto;
				break;
			case 'number':
				if (numero === null) return;
				valor = numero;
				break;
			case 'boolean':
				valor = booleano === 'true';
				break;
			case 'null':
				valor = null;
				break;
		}

		filas.push({ [llave]: valor });
		texto = '';
		numero = null;
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
		<select aria-label="Llave" bind:value={llave}>
			<option value="" disabled>Llave…</option>
			{#each llaves as l (l)}
				<option value={l}>{l}</option>
			{/each}
		</select>

		{#if mostrarTipo}
			<select
				aria-label="Tipo de dato"
				value={tipo}
				onchange={(e) => (seleccion = e.currentTarget.value as Tipo)}
			>
				{#each tipos as t (t)}
					<option value={t}>{t}</option>
				{/each}
			</select>
		{/if}

		<!-- El input cambia según el tipo -->
		{#if tipo === 'text'}
			<input
				type="text"
				aria-label="Valor"
				placeholder="Texto"
				bind:value={texto}
				onkeydown={onKeydown}
			/>
		{:else if tipo === 'number'}
			<input
				type="number"
				aria-label="Valor"
				placeholder="Número"
				bind:value={numero}
				onkeydown={onKeydown}
			/>
		{:else if tipo === 'boolean'}
			<select aria-label="Valor" bind:value={booleano}>
				<option value="true">true</option>
				<option value="false">false</option>
			</select>
		{:else}
			<input type="text" aria-label="Valor" value="null" disabled />
		{/if}

		<button type="button" onclick={agregar}>Agregar</button>
	</div>

	{#if filas.length}
		<ul>
			{#each filas as fila, i (i)}
				<li>
					<code>{JSON.stringify(fila)}</code>
					<button type="button" onclick={() => quitar(i)} aria-label="Quitar elemento {i + 1}">
						Quitar
					</button>
				</li>
			{/each}
		</ul>
		<button type="button" onclick={limpiar}>Limpiar todo</button>
	{/if}

	<!-- Se envía con el formulario padre -->
	<input type="hidden" {name} value={json} />

	<pre style="font-size: smaller">{preview}</pre>
</div>

<!-- Solo estructura para que sea responsivo -->
<style>
	.fila {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.fila > :global(*) {
		flex: 1 1 10rem;
		min-width: 0;
	}
</style>