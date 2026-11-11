<script>
	import { appState } from '$lib/stores/appState.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
</script>

{#if $appState.pageActions}
	<form method="POST" action="/auth/logout">
		<button type="submit" class="butter logout-button">{$profile?.nombre}</button>
	</form>
{/if}

<style>
	.logout-button {
		position: fixed;
		top: var(--a);
		left: var(--a);
		z-index: 9999;
		background-color: var(--color-error);
		color: white;
		font-weight: 600;
		cursor: pointer;
	}
</style>
