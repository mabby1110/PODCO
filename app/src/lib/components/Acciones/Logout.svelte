<script lang="ts">
	import { enhance } from '$app/forms';
	import { StoreAplicacion } from '$lib/stores/app/StoreAplicacion.svelte';
	import { profile } from '$lib/stores/profileStore.svelte';
</script>

<form
	class="logout"
	class:visible={StoreAplicacion.value.nav}
	method="POST"
	action="/auth/logout"
	use:enhance
>
	<button type="submit" class="butter logout-button">
		{$profile?.nombre}
	</button>
</form>

<style>
	.logout {
		display: none;
	}

	.logout.visible {
		display: block;
	}

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
