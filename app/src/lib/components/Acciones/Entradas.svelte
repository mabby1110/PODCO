<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { appState } from '$lib/stores/appState.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
	import { formatDateToReadable } from '$lib/utils/util';
	import { StoreEntradas, type TipoEvento } from '$lib/stores/StoreEntradas.svelte';
	import { tick } from 'svelte';

	type Entrada = {
		fecha: string;
		entrada: string;
		nombre_perfil?: string;
		id?: string;
		id_oportunidad?: string;
		id_actividad?: string;
	};

	let {
		historia,
		id_oportunidad,
		id_actividad,
		action = '?/updateHistoria',
		editando = false
	}: {
		historia: Entrada[];
		id_oportunidad?: string;
		id_actividad?: string;
		action?: string;
		editando?: boolean;
	} = $props();

	let lista = $state<Entrada[]>(historia || []);
	let nuevaEntrada = $state('');
	let isEditing = $derived(editando);
	let isSubmitting = $state(false);
	let formEl = $state<HTMLFormElement | null>(null);

	let listaSerializada = $derived(JSON.stringify(lista));

	async function syncAndSubmit() {
		isSubmitting = true;
		await tick();
		formEl?.requestSubmit();
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

	function asociarEvento(i: number, destino: TipoEvento, id: string) {
		// Validar que el modal realmente esté enviando el ID
		if (!id) {
			console.error(`Error: No se recibió el ID desde el modal al crear ${destino}`);
			return;
		}

		if (destino === 'oportunidad') {
			lista[i].id_oportunidad = id;
		} else {
			lista[i].id_actividad = id;
		}

		lista = [...lista];
		console.log('actualizar comentario', lista);
		syncAndSubmit();
	}
	function crearEvento(i: number, destino: TipoEvento) {
		// El origen es la entidad que estoy viendo, según el destino:
		// crear oportunidad desde una actividad -> creado_de_actividad
		// crear actividad desde una oportunidad -> creado_de_oportunidad
		const origen =
			destino === 'oportunidad'
				? id_actividad && { tipo: 'actividad' as const, id: id_actividad }
				: id_oportunidad && { tipo: 'oportunidad' as const, id: id_oportunidad };
		if (!origen) return;

		StoreEntradas.open({
			destino,
			origen,
			index_entrada: i,
			observaciones: lista[i].entrada,
			onSuccess: (id) => asociarEvento(i, destino, id)
		});

		if (destino === 'oportunidad') appState.toggleModalOp();
		else appState.toggleModalActivity();
	}
</script>

<div class="historial">
	{#if isEditing}
		<button class="jelly rojo accion" onclick={() => (isEditing = false)}>x</button>
	{/if}
	<form bind:this={formEl} method="POST" {action} use:enhance={handleSubmit}>
		<input type="hidden" name="id" value={id_actividad || id_oportunidad} />
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
									<span class="fecha-etiqueta">
										{#if item.id_oportunidad}
											<a class="enlace-evento" href="/oportunidades/{item.id_oportunidad}">
												Oportunidad
											</a>
										{/if}
										{#if item.id_actividad}
											<a class="enlace-evento" href="/actividades/{item.id_actividad}">
												Actividad
											</a>
										{/if}
									</span>
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
										{#if id_actividad}
											<button
												type="button"
												class="butter"
												onclick={() => crearEvento(i, 'oportunidad')}
											>
												+Oportunidad
											</button>
										{/if}
										{#if id_oportunidad}
											<button
												type="button"
												class="butter"
												onclick={() => crearEvento(i, 'actividad')}
											>
												+Actividad
											</button>
										{/if}
										<button type="button" class="butter" onclick={() => eliminar(i)}>
											Eliminar
										</button>
										<button
											type="button"
											class="butter accion"
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
		flex-grow: 1;
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
