<script lang="ts">
	import { profile } from '$lib/stores/profileStore.svelte';

	type Agente = {
		id: string | number;
		nombre: string;
	};

	let { agentes }: { agentes: Agente[] } = $props();

	let selectedClient = $state('');
</script>

{#if $profile?.isAdmin}
	<label>
		<span>Seleccionar Agente</span>
		<select name="id_agente" bind:value={selectedClient} class="butter" required>
			{#each agentes as agente}
				<option value={String(agente.id)}>{agente.nombre}</option>
			{/each}
		</select>
	</label>
{:else}
	<input type="hidden" name="id_agente" value={$profile?.id} />
{/if}
