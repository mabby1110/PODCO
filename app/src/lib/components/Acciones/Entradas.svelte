<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { appState } from '$lib/stores/appState.svelte';
	import { opModalStore } from '$lib/stores/opModalStore.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { formatDateToReadable } from '$lib/utils/util';

	let {
		historia = $bindable('[]'),
		objId,
		action = '?/updateHistoria',
		editando = false
	}: {
		historia: string;
		objId: string;
		action?: string;
		editando?: boolean;
	} = $props();

	let lista = $state<Record<string, any>[]>(
		historia && historia !== '' ? JSON.parse(historia) : []
	);

	let newData = $state({
		fecha: new Date().toISOString(),
		entrada: ''
	});

	let list_stringified = $derived(JSON.stringify(lista));
	let formEl = $state<HTMLFormElement | null>(null);
	let formInput = $state<HTMLFormElement | null>(null);

	function initNewData() {
		newData = {
			fecha: new Date().toISOString(),
			entrada: ''
		};
	}

	function eliminarEntrada(i: number) {
		if (!confirm('Eliminar entrada?')) return;

		lista.splice(i, 1);
		syncAndSubmit();
	}

	function saveNew() {
		if (!newData.entrada.trim()) return;

		const entry = {
			...newData,
			nombre_perfil: $profile?.nombre,
			id: $profile?.id
		};

		lista = [...lista, entry];
		syncAndSubmit();
		initNewData();
	}

	function syncAndSubmit() {
		historia = list_stringified;
		queueMicrotask(() => formEl?.requestSubmit());
	}

	function handleSubmit() {
		return async ({ update }: any) => {
			await update({ reset: false });
		};
	}

	function asociarOp(i: number, id_op: string) {
		lista[i].id_op = id_op;
		syncAndSubmit();
	}

	function handleHotOp(i: number, entrada: string) {
		console.log(i, entrada);
		opModalStore.open({
			index: i,
			observaciones: entrada,
			onSuccess: (id_op: string) => asociarOp(i, id_op)
		});
		appState.toggleModalOp();
	}

	function actualizarEntrada(i: number, nuevoTexto: string) {
		lista[i].entrada = nuevoTexto;
		lista[i].nombre_perfil = $profile?.nombre;
		lista[i].id = $profile?.id;
	}
</script>

<form bind:this={formEl} method="POST" {action} use:enhance={handleSubmit}>
	<input type="hidden" name="id" value={objId} />
	<input type="hidden" name="historia" value={list_stringified} />

	<div class="contenedor-historial">
		<div class="lista-entradas">
			{#if lista.length > 0}
				{#each lista as item, i}
					<div class="tarjeta-entrada">
						<div class="encabezado-entrada">
							<span class="fecha-etiqueta">
								{formatDateToReadable(item.fecha)}
							</span>
							{#if item.nombre_perfil}
								<span class="autor-etiqueta">{item.nombre_perfil}</span>
							{/if}
							{#if item.id_op}
								<a class="enlace-oportunidad" href="/oportunidades/{item.id_op}"> Oportunidad </a>
							{/if}
						</div>

						{#if editando}
							<div class="campo-edicion">
								<textarea
									class="area-texto"
									bind:value={item.entrada}
									onchange={(e) => actualizarEntrada(i, e.currentTarget.value)}
								></textarea>
								<div class="acciones-edicion">
									<button type="button" class="butter" onclick={() => handleHotOp(i, item.entrada)}>
										+Oportunidad
									</button>
									<button type="button" class="butter" onclick={() => eliminarEntrada(i)}>
										Eliminar
									</button>
									<button type="button" class="butter matcha" onclick={syncAndSubmit}>
										Guardar
									</button>
								</div>
							</div>
						{:else if item.entrada}
							<div class="contenido-texto">
								<p>{item.entrada}</p>
							</div>
						{/if}
					</div>
				{/each}
			{:else}
				<p class="mensaje-vacio">No hay entradas registradas</p>
			{/if}
		</div>

		<div class="formulario-nueva-entrada">
			<label class="campo-etiqueta">
				<span>Nueva Entrada</span>
				<textarea
					bind:value={newData.entrada}
					bind:this={formInput}
					class="area-texto"
					placeholder="Escriba aquí la nueva entrada..."
				></textarea>
			</label>
			<button type="button" class="butter matcha" onclick={saveNew}> Registrar </button>
		</div>
	</div>
</form>

<style>
	form {
		width: 100%;
	}

	.contenedor-historial {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		pointer-events: none;
	}
	button,
	textarea,
	a {
		pointer-events: all;
	}
	.lista-entradas {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		width: 100%;
		overflow-y: auto;
	}

	.tarjeta-entrada {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(var(--e), 1fr));
		padding: var(--a);
		border: 1px solid #e0e0e0;
		border-radius: var(--a);
	}

	.encabezado-entrada {
		grid-column: span 5;
		display: flex;
		align-items: baseline;
		gap: var(--a);
		font-size: small;
		font-weight: bold;
	}

	.fecha-etiqueta {
		color: #333;
	}

	.autor-etiqueta {
		padding: 0.1rem 0.4rem;
		border-radius: var(--a);
		justify-self: start;
	}

	.enlace-oportunidad {
		color: #0056b3;
		text-decoration: none;
		justify-self: start;
	}

	.area-texto {
		width: 100%;
		min-height: 70px;
		border-radius: var(--a);
	}

	.acciones-edicion {
		display: flex;
		justify-content: flex-end;
		gap: var(--a);
	}
	.contenido-texto,
	.campo-edicion {
		grid-column: span 9;
	}
	.contenido-texto p {
		white-space: pre-wrap;
		word-break: break-word;
	}

	.formulario-nueva-entrada {
		display: flex;
		align-items: flex-end;
		gap: 0.75rem;
		padding: 1rem;
		border: 1px solid #e0e0e0;
		border-radius: var(--a);
	}

	.campo-etiqueta {
		width: 100%;
	}
	.mensaje-vacio {
		text-align: center;
		color: #666;
		padding: 1rem 0;
	}
</style>
