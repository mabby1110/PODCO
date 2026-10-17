<script lang="ts">
	import { page } from '$app/state';
	import { profile } from '$lib/stores/profileStore.svelte';

	let agentes = $derived(page.data.agentes);

	let {
		selected = $bindable<string>()
	}: {
		selected?: string;
	} = $props();
</script>

{#if $profile?.isAdmin}
	<section>
		<div class="section-header">
			<h3>Seleccionar Agente</h3>
		</div>
		<div class="section-content">
			<select name="id_agente" bind:value={selected} class="milk" required>
				<option value="" disabled selected>Selecciona un agente</option>
				{#each agentes as agente}
					<option value={String(agente.id)}>
						{agente.nombre}
					</option>
				{/each}
			</select>
		</div>
	</section>
{:else}
	<input type="hidden" name="id_agente" value={$profile?.id} />
{/if}
