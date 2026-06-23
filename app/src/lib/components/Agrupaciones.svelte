<script lang="ts">
	import FiltroAgente from './FiltroAgente.svelte';
	import Select from './Select.svelte';
	import { selectedGroupStore } from '$lib/stores/groupFilter.svelte';

	let {
		agrupacionesSeleccionadas = $bindable(),
		agrupaciones,
		categorias
	} = $props<{
		agrupaciones: [];
		agrupacionesSeleccionadas: string[];
		categorias: any;
	}>();
	let show = $state(false);
	function seleccionarAgrupacion(e: string): void {
		const index = agrupacionesSeleccionadas.indexOf(e);
		console.log(e, index);
		if (index !== -1) {
			agrupacionesSeleccionadas.splice(index, 1);
		} else {
			agrupacionesSeleccionadas.push(e);
		}
	}
	function handleKeyDown(event) {
		if (event.key === 'Escape') {
			show = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />
{#if show}
	<div class="container">
		<div class="panel">
			<button class="close" type="button" onclick={() => (show = false)}>x</button>
			<FiltroAgente />
			<Select
				options={categorias}
				defaultOption="Agrupar todos"
				bind:selected={selectedGroupStore.selectedGroup}
			/>
			<div class="agrupaciones">
				{#each agrupaciones as agrupacion}
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
{:else}
	<button class="butter" onclick={() => (show = true)}>
		+Agrupar {agrupacionesSeleccionadas.length > 0 ? `(${agrupacionesSeleccionadas.length})` : ''}
	</button>
{/if}

<style>
	.container {
		order: 1;
	}
	.panel {
		display: flex;
		flex-wrap: wrap;
		gap: var(--a);
		width: fit-content;
		align-items: baseline;
		width: fit-content;
	}
	.agrupaciones {
		display: flex;
		gap: var(--a);
		flex-direction: column;
		width: 100%;
		max-height: 40vh;
		overflow: auto;
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
