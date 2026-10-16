<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { appState } from '$lib/stores/appState.svelte';
	import { opModalStore } from '$lib/stores/opModalStore.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { formatDateToReadable } from '$lib/utils/util';

	type Entrada = {
		fecha: string;
		entrada: string;
		nombre_perfil?: string;
		id?: string;
		id_op?: string;
	};

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

	let lista = $state<Entrada[]>(historia ? JSON.parse(historia) : []);
	let nuevaEntrada = $state('');
	let isEditing = $state(editando);
	let isSubmitting = $state(false);
	let formEl = $state<HTMLFormElement | null>(null);

	let listaSerializada = $derived(JSON.stringify(lista));

	function syncAndSubmit() {
		historia = listaSerializada;
		isSubmitting = true;
		queueMicrotask(() => formEl?.requestSubmit());
	}

	const handleSubmit: SubmitFunction = () => {
		return async ({ update }) => {
			await update({ reset: false });
			isSubmitting = false;
		};
	};

	function registrar() {
		if (!nuevaEntrada.trim()) return;

		lista.push({
			fecha: new Date().toISOString(),
			entrada: nuevaEntrada,
			nombre_perfil: $profile?.nombre,
			id: $profile?.id
		});
		nuevaEntrada = '';
		syncAndSubmit();
	}

	function eliminar(i: number) {
		if (!confirm('Eliminar entrada?')) return;
		lista.splice(i, 1);
		syncAndSubmit();
	}

	function marcarAutor(i: number) {
		lista[i].nombre_perfil = $profile?.nombre;
		lista[i].id = $profile?.id;
	}

	function asociarOp(i: number, id_op: string) {
		lista[i].id_op = id_op;
		syncAndSubmit();
	}

	function abrirOportunidad(i: number) {
		opModalStore.open({
			index: i,
			observaciones: lista[i].entrada,
			onSuccess: (id_op: string) => asociarOp(i, id_op)
		});
		appState.toggleModalOp();
	}
</script>

<div class="historial">
	{#if isEditing}
		<button class="jelly rojo accion" onclick={() => (isEditing = false)}>x</button>
	{/if}
	<form bind:this={formEl} method="POST" {action} use:enhance={handleSubmit}>
		<input type="hidden" name="id" value={objId} />
		<input type="hidden" name="historia" value={listaSerializada} />

		<div class="contenedor-historial honey">
			<div class="lista-entradas">
				{#each lista as item, i}
					<div
						class="entrada"
						role="presentation"
						title={isEditing ? undefined : 'Doble clic para editar'}
						ondblclick={() => (isEditing = true)}
					>
						<div class="tarjeta-entrada">
							<div class="autor">
								{#if item.nombre_perfil}
									<span>{item.nombre_perfil}</span>
								{/if}
								<span class="fecha-etiqueta">
									{formatDateToReadable(item.fecha)}
									{#if item.id_op}
										<a class="enlace-oportunidad" href="/oportunidades/{item.id_op}">
											Oportunidad
										</a>
									{/if}
								</span>
							</div>

							{#if isEditing}
								<div class="campo-edicion">
									<textarea
										class="area-texto"
										bind:value={item.entrada}
										onchange={() => marcarAutor(i)}
									></textarea>
									<div class="acciones-edicion">
										<button type="button" class="butter" onclick={() => abrirOportunidad(i)}>
											+Oportunidad
										</button>
										<button type="button" class="butter" onclick={() => eliminar(i)}>
											Eliminar
										</button>
										<button
											type="button"
											class="butter matcha"
											onclick={syncAndSubmit}
											disabled={isSubmitting}
										>
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
					</div>
				{:else}
					<p class="mensaje-vacio">No hay entradas registradas</p>
				{/each}
			</div>

			<div class="formulario-nueva-entrada">
				<label class="campo-etiqueta">
					<span>Nueva Entrada</span>
					<textarea
						bind:value={nuevaEntrada}
						class="area-texto"
						placeholder="Escriba aquí la nueva entrada..."
					></textarea>
				</label>
				<button type="button" class="butter matcha" onclick={registrar}>Registrar</button>
			</div>
		</div>
	</form>
</div>

<style>
	.historial {
		display: flex;
		gap: var(--a);
	}
	.entrada {
		display: flex;
		flex-direction: column;
		cursor: pointer;
	}

	form {
		width: 100%;
	}

	.contenedor-historial {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		padding: var(--a);
	}

	.lista-entradas {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		width: 100%;
	}

	.tarjeta-entrada {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(var(--d), 1fr));
		gap: var(--a);
	}

	.autor {
		grid-column: span 4;
		justify-self: start;
		display: flex;
		flex-direction: column;
		border-radius: var(--a);
	}

	.fecha-etiqueta {
		grid-column: span 3;
		font-size: small;
	}

	.enlace-oportunidad {
		color: #0056b3;
		text-decoration: none;
	}

	.contenido-texto,
	.campo-edicion {
		grid-column: span 12;
	}

	.contenido-texto p {
		white-space: pre-wrap;
		word-break: break-word;
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

	.formulario-nueva-entrada {
		display: flex;
		align-items: flex-end;
		gap: var(--a);
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
