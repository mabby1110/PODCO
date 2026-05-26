<script lang="ts">
    import FormSelectMotivo from '../FormSelectMotivo.svelte';
    import { motivosProspeccion } from '$lib';
    import { page } from '$app/state';
    import FormInputAddContact from '$lib/components/FormInputAddContact.svelte';

    let {
        isDuplicate = $bindable()
    }: {
        isDuplicate: boolean;
    } = $props();
    
    let { clientes } = $derived(page.data);

    // --- Único picker para la búsqueda ---
    let nombre_comercial = $state('');
    let ubicacion = $state('');

    // --- Lógica de filtrado reactivo ---
    let matches = $derived.by(() => {
        const query = nombre_comercial.trim().toLowerCase();

        // Si el campo está vacío, no buscamos nada
        if (!query) return [];

        return clientes?.filter((c: any) => {
            // Verificamos si el texto ingresado coincide con cualquiera de los dos campos
            const matchRazon = c.razon_social?.toLowerCase().includes(query) ?? false;
            const matchComercial = c.nombre_comercial?.toLowerCase().includes(query) ?? false;

            return matchRazon || matchComercial;
        }) ?? [];
    });

    // Validamos duplicados
    $effect(() => {
        isDuplicate = nombre_comercial.trim() === '' || matches.length > 0;
    });
</script>

<div class="form-content">
    <label>
        <span>Cliente (Nombre comercial o Razón social)</span>
        <input
            name="nombre_comercial"
            bind:value={nombre_comercial}
            placeholder="Ej. Nestlé / BMS"
            required
        />
    </label>

    {#if matches.length > 0}
        <ul class="matches">
            {#each matches as match}
                <li
                    class:exact={
                        match.razon_social?.toLowerCase().trim() === nombre_comercial.toLowerCase().trim() ||
                        match.nombre_comercial?.toLowerCase().trim() === nombre_comercial.toLowerCase().trim()
                    }
                >
                    {match.nombre_comercial ?? match.razon_social}
                    <br />
                    <small style="font-style: italic;">Razon social: {match.razon_social}</small>
                </li>
            {/each}
        </ul>
    {/if}

    <FormSelectMotivo
        title="Tipo de prospeccion"
        name={'tipo_prospeccion'}
        list={motivosProspeccion}
    />

    <label>
        <span>Ubicacion</span>
        <textarea
            name="ubicacion"
            id="ubicacion"
            bind:value={ubicacion}
            required
            rows="3"
            placeholder="copiar y pegar de google maps ej. Antonio Bravo 128, Las Liebres, 45623 San Pedro Tlaquepaque, Jal."
        ></textarea>
    </label>

    <FormInputAddContact />
</div>

<style>
	/* Opcional: un pequeño estilo para diferenciar el nombre comercial de la razón social en la lista */
	.razon-sub {
		font-size: 0.9em;
		color: #666;
		margin-left: 5px;
	}
	.matches li.exact {
		color: #d32f2f;
		background-color: #ffebee;
		font-weight: bold;
	}
	.form-content {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--b);
		border-radius: 12px;
		border: 1px solid var(--color-contrast);
		padding: var(--b);
	}
	.matches {
		list-style: none;
		margin: -0.5rem 0 0;
		padding: 0;
		font-size: 0.85rem;
	}
	.matches li {
		padding: 0.2rem 0;
		color: #555;
	}

	.matches li.exact {
		color: #c0392b;
		font-weight: 600;
	}
</style>
