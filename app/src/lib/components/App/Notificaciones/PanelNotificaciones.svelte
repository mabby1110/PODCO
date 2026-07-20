<script lang="ts">
	import { page } from '$app/state';
	import { slide } from 'svelte/transition';

	let { notificaciones } = $derived(page.data);

	// Diccionario simple para que la acción sea legible
	const actionMap: Record<string, string> = {
		add: 'creó',
		update: 'actualizó',
		delete: 'eliminó',
		comment: 'comentó en'
	};

	function formatDate(dateString: string) {
		if (!dateString) return '';
		return new Date(dateString).toLocaleString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// function handleKeyDown(event: KeyboardEvent) {
	// 	if (event.altKey && event.key === 's') {
	// 		event.preventDefault();
	// 		showFilter = !showFilter;
	// 	}
	// 	if (event.key === 'Escape') {
	// 		showFilter = false;
	// 	}
	// }
</script>

<!-- <svelte:window onkeydown={handleKeyDown} onmousemove={onMouseMove} onmouseup={onMouseUp} /> -->

<div class="panel notif-container" in:slide>
	{#each notificaciones as notificacion (notificacion.id)}
		<div class="notif-card {notificacion.visto ? 'read' : 'unread'}">
			<div class="notif-header">
				<strong>{notificacion.profiles.nombre}</strong>
				<span>{actionMap[notificacion.historial.accion] || notificacion.historial.accion}</span>
				<span>un/a {notificacion.historial.tipo_objeto}</span>
			</div>

			<div class="notif-meta">
				<small>{formatDate(notificacion.fecha_creacion)}</small>
				{#if !notificacion.visto}
					<span class="badge">Nueva</span>
				{/if}
			</div>

			{#if notificacion.historial.cambios}
				<details class="notif-details">
					<summary>Ver datos</summary>
					<pre><code>{JSON.stringify(notificacion.historial.cambios, null, 2)}</code></pre>
				</details>
			{/if}
		</div>
	{:else}
		<div class="empty-state">No hay notificaciones.</div>
	{/each}
</div>

<style>
	/* Contenedor principal de notificaciones */
	.notif-container {
		display: flex;
		flex-direction: column-reverse;
		gap: var(--a);
        height: 100%;
		overflow-y: scroll;
	}

	/* Tarjeta individual de notificación */
	.notif-card {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.75rem;

	}

	/* Diferenciador visual entre leídas y no leídas (usando opacidad) */
	.notif-card.read {
		opacity: 0.5;
	}
	.notif-card.unread {
		opacity: 1;
	}

	.notif-header {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		line-height: 1.3;
	}

	.notif-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		opacity: 0.8;
	}

	.badge {
		border: 1px solid;
		border-radius: 12px;
		padding: 0 0.4rem;
		font-size: 0.7em;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Detalles colapsables para los cambios JSON */
	.notif-details {
		margin-top: 0.5rem;
		border-top: 1px dashed;
		padding-top: 0.5rem;
	}

	.notif-details summary {
		cursor: pointer;
		font-size: 0.85em;
		opacity: 0.8;
	}

	.notif-details pre {
		margin: 0.5rem 0 0 0;
		font-size: 0.75em;
		overflow-x: auto;
		padding: 0.5rem;
		border: 1px solid;
		opacity: 0.8;
	}

	.empty-state {
		padding: 1rem;
		text-align: center;
		opacity: 0.5;
	}
</style>
