<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, data, children } = $props<{
		title: string;
		data?: string | any[] | null;
	}>();

	// Estado local para abrir/cerrar
	let isOpen = $state(false);

	// Parseo seguro usando runas. Funciona si recibe string o array.
	let items = $derived.by(() => {
		if (!data) return [];
		if (Array.isArray(data)) return data;
		try {
			return JSON.parse(data);
		} catch {
			return [];
		}
	});
</script>

{#if items.length > 0}
	<div class="file-preview">
		<h3>
			<button type="button" onclick={() => (isOpen = !isOpen)} class="accordion-btn">
				{title} ({items.length})
				<span class="icon">{isOpen ? '▼' : '▶'}</span>
			</button>
		</h3>

		{#if isOpen}
			<div class="documentos">
				{#each items as item}
					<iframe src={item.preview} class="iframe" title="Descripción del documento" loading="lazy"
					></iframe>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	.file-preview {
		padding: 0 var(--a);
	}
	.accordion-btn {
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		color: inherit;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		text-align: left;
	}
	.icon {
		font-size: 0.8em;
		opacity: 0.7;
	}
</style>
