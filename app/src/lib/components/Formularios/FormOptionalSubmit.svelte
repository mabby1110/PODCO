<script lang="ts">
	import { fasesOportunidad } from "$lib";

	let {
		siguienteFase = $bindable(),
		isOpen = $bindable(),
		submit = $bindable(),
		submitCancel = $bindable()
	}: {
		siguienteFase: any;
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
</script>

{#if !isOpen}
	{#if submitCancel}
		<button class="butter" type="button" onclick={toggleCancel}> Descartar </button>
	{/if}
	<button class="butter" style={siguienteFase.estilo} type="button" onclick={toggleSubmit}> {siguienteFase.actual} </button>
{:else}
	<button class="butter chile" type="button" onclick={close}>✕</button>
{/if}
