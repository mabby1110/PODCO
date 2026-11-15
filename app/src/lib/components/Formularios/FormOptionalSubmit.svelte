<script lang="ts">
	import { fasesOportunidad } from '$lib';

	let {
		fase = $bindable(),
		listaFases = [],
		isOpen = $bindable(),
		submit = $bindable(),
		submitCancel = $bindable()
	}: {
		fase: any;
		listaFases: any;
		isOpen: boolean;
		submit: boolean;
		submitCancel?: boolean;
	} = $props();

	function toggleSubmit() {
		close();
		isOpen = true;
		submit = true;
	}
	function toggleCancel() {
		close();
		isOpen = true;
		submitCancel = true;
	}

	function close() {
		isOpen = false;
		submit = false;
		submitCancel = false;
	}

	$effect(() => {
		if (!isOpen) {
			close();
		}
	});

	let siguienteFase = $derived(listaFases[fase.id_fase + 1]);
</script>

{#if !isOpen}
	<button class="honey accion" type="button" onclick={toggleCancel}> Descartar </button>
	<button class="honey rojo accion" style={siguienteFase.estilo} type="button" onclick={toggleSubmit}>
		{fase.accion}
	</button>
{:else}
	<button class="honey accion rojo" type="button" onclick={close}>✕</button>
{/if}
