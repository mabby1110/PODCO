<script lang="ts">
	import { selectedOp } from "$lib/stores/selectedOp";
	import { invalidate } from '$app/navigation';

	async function eliminar() {
		if (!$selectedOp?.id) return;

		const form = new FormData();
		form.append('id', $selectedOp.id);

		const res = await fetch('/api/eliminar', {
			method: 'POST',
			body: form
		});

		if (res.ok) {
			$selectedOp = null;
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
