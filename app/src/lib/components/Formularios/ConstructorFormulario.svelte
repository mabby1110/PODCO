<script lang="ts">
	type TipoCampo = 'text' | 'numero' | 'select' | 'textarea' | 'fecha' | 'booleano';

	interface Campo {
		uid: number;
		tipo: TipoCampo;
		etiqueta: string;
		id_campo: string;
		requerido: boolean;
		unidad: string; // solo numero
		opcionesTexto: string; // solo select, una opción por línea
		idManual: boolean; // si el usuario editó el id, deja de autogenerarse
	}

	let { value = $bindable(''), valido = $bindable(true) }: { value?: string; valido?: boolean } =
		$props();

	const TIPOS: { valor: TipoCampo; nombre: string }[] = [
		{ valor: 'text', nombre: 'Texto' },
		{ valor: 'numero', nombre: 'Número' },
		{ valor: 'select', nombre: 'Selección' },
		{ valor: 'textarea', nombre: 'Texto largo' },
		{ valor: 'fecha', nombre: 'Fecha' },
		{ valor: 'booleano', nombre: 'Sí / No' }
	];

	let siguienteUid = 0;
	let campos = $state<Campo[]>([]);
	let jsonImport = $state('');
	let errorImport = $state<string | null>(null);

	function slug(s: string) {
		return s
			.trim()
			.toLowerCase()
			.replace(/ñ/g, '\u0001') // conserva la ñ (como en tus ids actuales)
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/\u0001/g, 'ñ')
			.replace(/[^a-z0-9ñ]+/g, '_')
			.replace(/^_+|_+$/g, '');
	}

	function nuevoCampo(parcial: Partial<Campo> = {}): Campo {
		return {
			uid: siguienteUid++,
			tipo: 'text',
			etiqueta: '',
			id_campo: '',
			requerido: false,
			unidad: '',
			opcionesTexto: '',
			idManual: false,
			...parcial
		};
	}

	function agregar() {
		campos.push(nuevoCampo());
	}

	function eliminar(i: number) {
		campos.splice(i, 1);
	}

	function mover(i: number, dir: -1 | 1) {
		const j = i + dir;
		if (j < 0 || j >= campos.length) return;
		[campos[i], campos[j]] = [campos[j], campos[i]];
	}

	function alCambiarEtiqueta(c: Campo, etiqueta: string) {
		c.etiqueta = etiqueta;
		if (!c.idManual) c.id_campo = slug(etiqueta);
	}

	function alCambiarId(c: Campo, id: string) {
		c.idManual = true;
		c.id_campo = slug(id);
	}

	// Errores por campo
	let errores = $derived(
		campos.map((c) => {
			const e: string[] = [];
			if (!c.etiqueta.trim()) e.push('Falta la etiqueta');
			if (!c.id_campo) e.push('Falta el id');
			else if (campos.filter((o) => o.id_campo === c.id_campo).length > 1) e.push('Id duplicado');
			if (c.tipo === 'select' && !c.opcionesTexto.trim()) e.push('Agrega al menos una opción');
			return e;
		})
	);

	$effect(() => {
		valido = errores.every((e) => e.length === 0);
	});

	// Campos -> JSON (el orden de las claves coincide con tu ejemplo)
	let salida = $derived({
		formulario_registro: campos.map((c) => {
			const o: Record<string, unknown> = {
				tipo: c.tipo,
				etiqueta: c.etiqueta.trim(),
				id_campo: c.id_campo,
				requerido: c.requerido
			};
			if (c.tipo === 'numero' && c.unidad.trim()) o.unidad = c.unidad.trim();
			if (c.tipo === 'select')
				o.opciones = c.opcionesTexto
					.split('\n')
					.map((s) => s.trim())
					.filter(Boolean);
			return o;
		})
	});

	let json = $derived(JSON.stringify(salida, null, 2));

	$effect(() => {
		value = JSON.stringify(salida);
	});

	// JSON -> campos (importar uno existente)
	function importar() {
		errorImport = null;
		try {
			const data = JSON.parse(jsonImport);
			const lista = data?.formulario_registro;
			if (!Array.isArray(lista)) throw new Error('Falta el arreglo "formulario_registro"');

			campos = lista.map((x: any) =>
				nuevoCampo({
					tipo: TIPOS.some((t) => t.valor === x.tipo) ? x.tipo : 'text',
					etiqueta: String(x.etiqueta ?? ''),
					id_campo: String(x.id_campo ?? ''),
					requerido: !!x.requerido,
					unidad: String(x.unidad ?? ''),
					opcionesTexto: Array.isArray(x.opciones) ? x.opciones.join('\n') : '',
					idManual: true
				})
			);
			jsonImport = '';
		} catch (e) {
			errorImport = (e as Error).message;
		}
	}
</script>

<div class="form-content">
	{#each campos as c, i (c.uid)}
		<div class="campo milk">
			<strong class="num">{i + 1}</strong>

			<label class="f tipo">
				Tipo
				<select bind:value={c.tipo}>
					{#each TIPOS as t (t.valor)}
						<option value={t.valor}>{t.nombre}</option>
					{/each}
				</select>
			</label>

			<label class="f grow">
				Etiqueta
				<input
					type="text"
					value={c.etiqueta}
					oninput={(e) => alCambiarEtiqueta(c, e.currentTarget.value)}
				/>
			</label>

			<label class="f grow">
				Id
				<input
					type="text"
					value={c.id_campo}
					onchange={(e) => {
						alCambiarId(c, e.currentTarget.value);
						e.currentTarget.value = c.id_campo;
					}}
				/>
			</label>

			{#if c.tipo === 'numero'}
				<label class="f unidad">
					Unidad
					<input type="text" bind:value={c.unidad} placeholder="mm, kg..." />
				</label>
			{/if}

			<label class="check">
				<input type="checkbox" bind:checked={c.requerido} />
				Requerido
			</label>

			<div class="acciones">
				<button class="butter" type="button" onclick={() => mover(i, -1)} disabled={i === 0}
					>↑</button
				>
				<button
					class="butter"
					type="button"
					onclick={() => mover(i, 1)}
					disabled={i === campos.length - 1}>↓</button
				>
				<button class="butter" type="button" onclick={() => eliminar(i)}>✕</button>
			</div>

			{#if c.tipo === 'select'}
				<label class="f full">
					Opciones (una por línea)
					<textarea rows="3" bind:value={c.opcionesTexto}></textarea>
				</label>
			{/if}

			{#if errores[i].length}
				<div class="errores full">
					{#each errores[i] as err}
						<small>{err}</small>
					{/each}
				</div>
			{/if}
		</div>
	{/each}

	<button class="butter" type="button" onclick={agregar}>Agregar campo</button>

	<details>
		<summary>Ver / importar JSON</summary>

		<label>
			JSON generado
			<textarea rows="10" readonly value={json}></textarea>
		</label>

		<label>
			Importar JSON (reemplaza los campos actuales)
			<textarea rows="6" bind:value={jsonImport}></textarea>
		</label>
		<button class="butter" type="button" onclick={importar} disabled={!jsonImport.trim()}>Importar</button>
		{#if errorImport}
			<small>JSON inválido: {errorImport}</small>
		{/if}
	</details>
</div>

<style>
	.campo {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: calc(var(--a) / 2) var(--a);
		padding: calc(var(--a) / 2) var(--a);
	}

	.num {
		align-self: center;
		min-width: 1.5ch;
	}

	/* Label con el texto arriba y el control debajo */
	.f {
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-size: 0.8em;
		min-width: 0;
	}
	.f input,
	.f select,
	.f textarea {
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
	}

	/* Anchos flexibles: crecen, y envuelven si no caben */
	.tipo {
		flex: 0 1 120px;
	}
	.grow {
		flex: 1 1 140px;
	}
	.unidad {
		flex: 0 1 100px;
	}
	.full {
		flex: 1 1 100%;
	}

	.check {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 0.8em;
		white-space: nowrap;
		padding-bottom: 4px;
	}

	.acciones {
		display: flex;
		gap: 4px;
		margin-left: auto; /* empuja los botones al final de la fila */
	}

	.errores {
		display: flex;
		flex-wrap: wrap;
		gap: 4px var(--a);
	}
</style>
