<script lang="ts">
	import { StoreAplicacion } from '$lib/stores/app/StoreAplicacion.svelte';
	import { StoreHotkeys } from '$lib/stores/app/StoreHotkeys.svelte';
	let {
		key = 'q',
		id_store = 'controles',
		children = $bindable(),
		onclick
	}: {
		key: string;
		id_store: string;
		children: any;
		onclick?: (e: MouseEvent | KeyboardEvent) => void;
	} = $props();

	function handleClick(e: MouseEvent | KeyboardEvent) {
		const manejado = onclick?.(e);
		if (manejado === false || !onclick) {
			StoreAplicacion.toggle('modal_editar_pedido')
		}
	}
</script>

<button
	class:activo={StoreAplicacion.value.modal_editar_pedido}
	class="honey accion"
	onclick={handleClick}
>
	{#if StoreHotkeys.active && StoreHotkeys.get(key)}
		<span class="hotkey-badge">
			{StoreHotkeys.get(key)?.key.toUpperCase()}
		</span>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</button>
