<script lang="ts">
	import { StoreAplicacion } from '$lib/stores/app/StoreAplicacion.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
	let submit = $state(false);
	function handleSubmit(event: SubmitEvent) {
		submit = true;
		event.preventDefault();
	}
</script>

{#if StoreAplicacion.value.nav || submit}
	<form onsubmit={handleSubmit}>
		<button type="submit" class="butter logout-button">
			{$profile?.nombre}
		</button>
	</form>
{/if}

<style>
	.logout-button {
		position: fixed;
		top: var(--a);
		right: var(--a);
		z-index: 9999;
		background-color: var(--color-error);
		color: white;
		font-weight: 600;
		cursor: pointer;
	}
</style>
