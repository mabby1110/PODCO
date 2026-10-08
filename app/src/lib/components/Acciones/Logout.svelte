<script>
	import { appState } from '$lib/stores/appState.svelte';
	import { fade } from 'svelte/transition';
</script>

<form method="POST" action="/auth/logout">
	<button type="submit" class="butter logout-button">Cerrar sesión</button>
</form>

<style>
	.logout-button {
		z-index: 9999;
		background-color: var(--color-error);
		color: white;
		font-weight: 600;
		cursor: pointer;
	}
</style>
