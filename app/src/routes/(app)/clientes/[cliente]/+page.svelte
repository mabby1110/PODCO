<script lang="ts">
    import { page } from '$app/state';
    import { profile } from '$lib/stores/profileStore.svelte';
    import { appState } from '$lib/stores/appState.svelte';
    import EditableField from '$lib/components/EditableField.svelte';
    import EditableSelectField from '$lib/components/EditableSelectField.svelte';
    import FormEditableContact from '$lib/components/Cliente/FormEditableContact.svelte';
    import CardOpListPreview from '$lib/components/Oportunidad/CardOpListPreview.svelte';
    import Card from '$lib/components/Card.svelte';

    let { cliente, oportunidades, agentes } = $derived(page.data);
    let openOp = $derived(oportunidades?.filter((a: any) => a.id_cliente == cliente.id));

    const formatDate = (date: string | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            ...(date.includes('T') || date.includes(':') ? { hour: '2-digit', minute: '2-digit' } : {})
        });
    };
</script>

<Card>
    {#snippet header()}
        <a href="/clientes" class="close" aria-label="Cerrar">✕</a>
        <h1>{cliente.razon_social}</h1>
        <div class="meta">
            <p>
                <span style="color:{cliente.id_contpaqi ? 'green' : 'red'}">
                    {cliente.id_contpaqi ? 'Sincronizado' : 'Sin sincronizar'}
                </span> con Contpaqi
            </p>
            <p>ID: <strong>{cliente.id}</strong></p>
        </div>
    {/snippet}

    {#snippet content()}
        <EditableField
            label="Razón Social"
            name="razon_social"
            value={cliente.razon_social}
            id={cliente.id}
            action="/clientes?/updateClient"
            placeholder="Nombre de la empresa"
        />

        <div class="grid-fields">
             <EditableField
                label="Estado"
                name="estado"
                value={cliente.estado}
                id={cliente.id}
                action="/clientes?/updateClient"
                placeholder="Estado"
            />
            <EditableField
                label="Ciudad"
                name="ciudad"
                value={cliente.ciudad}
                id={cliente.id}
                action="/clientes?/updateClient"
                placeholder="Ciudad"
            />
        </div>

        <EditableField
            label="Sector"
            name="sector"
            value={cliente.sector}
            id={cliente.id}
            action="/clientes?/updateClient"
            placeholder="Sector económico"
        />

        {#if $profile?.isAdmin}
            <EditableSelectField
                label="Agente"
                name="id_agente"
                id={cliente.id}
                value={cliente.id_agente}
                options={agentes}
                action="/clientes?/updateClient"
                hint="Asignar responsable"
            />
        {:else}
            <div class="detail-block">
                <h3 class="label">Agente:</h3>
                <div class="detail-body">
                    <p class="value">{$profile?.nombre}</p>
                </div>
            </div>
        {/if}

        <FormEditableContact
            jsonList={cliente.contactos}
            id={cliente.id}
            action="/clientes?/updateClient"
        />

        <div class="system">
            <div class="detail-block">
                <span class="label">Tipo de Prospección:</span>
                <p class="value">{cliente.tipo_prospeccion || 'Cartera de clientes original'}</p>
            </div>
            <div class="detail-block">
                <span class="label">Fecha de creación:</span>
                <p class="value">{formatDate(cliente.fecha_creacion)}</p>
            </div>
            <div class="detail-block">
                <span class="label">Última actualización:</span>
                <p class="value">{formatDate(cliente.ultima_actualizacion)}</p>
            </div>
            {#if cliente.fecha_sync}
                <div class="detail-block">
                    <span class="label">Última sincronización:</span>
                    <p class="value">{formatDate(cliente.fecha_sync)}</p>
                </div>
            {/if}
        </div>
    {/snippet}

    {#snippet actions()}
        {#if openOp.length > 0}
            <div class="op-list">
                <div class="controls">
                    <button onclick={() => appState.toggleModalOp()} class="butter">+Oportunidad</button>
                </div>
                {#each openOp as op}
                    <CardOpListPreview event={op} />
                {/each}
            </div>
        {/if}
    {/snippet}
</Card>

<style>
    .meta { display: flex; gap: var(--a); }
    .close { 
        position: absolute; top: 0; right: 0; 
        padding: 0 var(--a); opacity: 0.6; 
        text-decoration: none; color: inherit;
    }
    .grid-fields { display: grid; grid-template-columns: 1fr 1fr; gap: var(--a); }
    .system {
        display: flex; gap: var(--b); flex-wrap: wrap;
        border-top: 1px solid var(--color-secondary);
        padding: var(--c) var(--a) var(--f); margin-top: var(--c);
    }
    .op-list {
        display: flex; flex-direction: column; gap: var(--a);
        width: 100%;
    }
</style>