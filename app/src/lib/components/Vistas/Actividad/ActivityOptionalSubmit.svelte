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
	function toggleUpdate() {
		close();
		isOpen = true;
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

	$effect(()=>{
		if(!isOpen) {
			close();
		}
	})
</script>

{#if !isOpen}
	<button class="butter" type="button" onclick={toggleCancel}>Descartar</button>
	<button class="butter" type="button" onclick={toggleSubmit}> {nextFase} </button>
{:else}
	<button class="close-btn" type="button" onclick={close}>✕</button>
{/if}

<style>
	.close-btn {
		border: none;
		cursor: pointer;
		width: var(--d);
		height: var(--d);
		border-radius: 4px;
		background-color: var(--color-error);
		color: #000;
		transition: all 0.2s;
	}
	.close-btn:hover {
		background: #f3f4f6;
		color: #000;
	}
</style>
