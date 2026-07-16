<script lang="ts">
	import Select from '../Select.svelte';
	import { agrupacionesStore } from '$lib/stores/agrupacionesStore.svelte';
	import { page } from '$app/state';
	import { appState } from '$lib/stores/appState.svelte';

	let {
		agrupacionesSeleccionadas = $bindable(),
		grupos,
		categorias,
		cookies = page.url.pathname
	} = $props<{
		grupos: any;
		agrupacionesSeleccionadas: string[];
		categorias: any;
		cookies?: string;
	}>();

	let show = $derived($appState.min);

	function seleccionarAgrupacion(e: string): void {
		const index = agrupacionesSeleccionadas.indexOf(e);

		if (index !== -1) {
			agrupacionesSeleccionadas = agrupacionesSeleccionadas.filter((item) => item !== e);
		} else {
			agrupacionesSeleccionadas = [...agrupacionesSeleccionadas, e];
		}
	}

	function seleccionarTodos(): void {
		agrupacionesSeleccionadas = grupos.map((a: any) => a.grupo);
	}
	function borrar(): void {
		agrupacionesSeleccionadas = [];
	}
</script>

<div class="contenedor-agrupaciones">
	<div class="panel">
		<div class="acciones">
			<Select
				options={categorias}
				defaultOption="Agrupar todos"
				bind:selected={agrupacionesStore.filtersByRoute[cookies]}
			/>

			<button onclick={appState.toggleMin} class="butter">
				{show ? 'min' : 'max'}
			</button>
			<button class="butter" onclick={seleccionarTodos}> Todos </button>
			<button class="butter" onclick={borrar}>
				borrar ({agrupacionesSeleccionadas.length})
			</button>
		</div>

		<div class="agrupaciones">
			{#each grupos as agrupacion}
				<button
					class="butter"
					class:seleccionado={agrupacionesSeleccionadas.includes(agrupacion.grupo)}
					onclick={() => seleccionarAgrupacion(agrupacion.grupo)}
				>
					{agrupacion.grupo}
				</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.contenedor-agrupaciones {
		width: 100%;
	}
	.panel {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		height: fit-content;
		flex-grow: 1;
		align-items: baseline;
		background-color: var(--color-contrast);
	}
	.acciones {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
	.agrupaciones {
		flex-grow: 1;
		display: flex;
		gap: var(--a);
		flex-direction: column;
		max-height: 30vh;
		overflow: auto;
	}
	.butter {
		height: fit-content;
	}
	.agrupaciones button {
		border: none;
		text-align: start;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
	}
	.agrupaciones button:hover {
		opacity: 40%;
	}
	.agrupaciones button.seleccionado:hover {
		opacity: 40%;
	}
	.agrupaciones button.seleccionado {
		background-color: var(--color-highlight);
	}
</style>
