<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { StoreHotkeys } from '$lib/stores/app/StoreHotkeys.svelte';
	import { StoreAplicacion } from '$lib/stores/app/StoreAplicacion.svelte';
	import { page } from '$app/state';

	const routes = [
		{ path: '/calendario', label: 'Calendario', icon: '📆', key: '1' },
		{ path: '/clientes', label: 'Clientes', icon: '👨‍💼', key: '2' },
		{ path: '/oportunidades', label: 'Oportunidades', icon: '📋', key: '3' },
		{ path: '/actividades', label: 'Actividades', icon: '⚡', key: '4' },
		{ path: '/pedidos', label: 'Pedidos', icon: '📦', key: '5' },
		{ path: '/catalogo', label: 'Catálogo', icon: '📑', key: '6' }
	];

	function togglePanel(event: MouseEvent) {
		event.stopPropagation();
		event.preventDefault();
		StoreAplicacion.toggle('nav');
	}

	function navigate(path: string) {
		goto(path);
	}
	$effect(() => {
		if (!StoreAplicacion.value.nav) return;

		return StoreHotkeys.registerEscape('nav', () => StoreAplicacion.set('nav', false));
	});

	onMount(() => {
		const unregister = routes.map((route) =>
			StoreHotkeys.register({
				id: `navigation-${route.key}`,
				key: route.key,
				label: `Ir a ${route.label}`,
				action: () => navigate(route.path)
			})
		);
		return () => {
			unregister.forEach((dispose) => dispose());
		};
	});
</script>

<div class="nav-container">
	{#if StoreHotkeys.active || StoreAplicacion.value.nav}
		<div class="nav-links honey">
			{#each routes as route (route.key)}
				<button
					onclick={() => navigate(route.path)}
					class="link"
					class:activo={route.path == page.url.pathname}
					type="button"
				>
					<span>{route.label} {route.icon}</span>

					{#if StoreHotkeys.active}
						<span class="hotkey-badge">{route.key}</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}

	<button
		onclick={togglePanel}
		class="home honey"
		class:activo={StoreAplicacion.value.nav}
		type="button"
	>
		<img src="/bms-logo.svg" alt="BMS" />
	</button>
</div>

<style>
	.nav-container {
		position: relative;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		max-width: 100vw;
		align-items: flex-end;
	}

	.nav-links {
		display: flex;
		flex-direction: column;
		position: absolute;
		bottom: var(--e);
		right: 0;
		padding: var(--b);
		gap: var(--a);
	}

	.nav-links button {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--a);
		padding: var(--a);
		min-width: var(--g);
	}

	.nav-links button:hover {
		background-color: var(--color-button-highlight);
	}

	.home {
		padding: var(--y);
		height: var(--d);
	}
	.link {
		position: relative;
	}
</style>
