<script lang="ts">
	import { selectedEvent } from "$lib/stores/selectedEvent";
	import { invalidate } from '$app/navigation';

	async function eliminar() {
		if (!$selectedEvent?.id) return;

		const form = new FormData();
		form.append('id', $selectedEvent.id);

		const res = await fetch('/api/eliminar', {
			method: 'POST',
			body: form
		});

		if (res.ok) {
			$selectedEvent = null;
			await invalidate('app:data');
		}
	}
</script>


<button class="delete" on:click|stopPropagation={eliminar}> Eliminar </button>

<style>
	.delete {
		margin-top: 8px;
		align-self: flex-end;
		background: #c62828;
		color: white;
		border: none;
		padding: 6px 10px;
		border-radius: 6px;
		font-size: 0.75rem;
		cursor: pointer;
	}
</style>
