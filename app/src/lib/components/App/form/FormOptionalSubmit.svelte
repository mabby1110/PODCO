<script lang="ts">
	let {
		nextFase = $bindable(),
		isOpen = $bindable(),
		submit = $bindable(),
		submitCancel = $bindable()
	}: {
		nextFase: string;
		isOpen: boolean;
		submit: boolean;
		submitCancel: boolean;
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
	<button class="butter" type="button" onclick={toggleCancel}> Descartar </button>
	<button class="butter" type="button" onclick={toggleSubmit}> {nextFase} </button>
{:else}
	<button class="butter chile" type="button" onclick={close}>✕</button>
{/if}
