<script lang="ts">
    import { page } from '$app/state';
    import { slide } from 'svelte/transition';
    import { selectedClient } from '$lib/stores/selectedClient';
    import { profile } from '$lib/stores/profileStore.svelte';
    import EditableField from '$lib/components/EditableField.svelte';
    import EditableSelectField from '$lib/components/EditableSelectField.svelte';
    import FormEditableContact from '$lib/components/Cliente/FormEditableContact.svelte';

    let { data } = $props();

    const agentes = $derived(page.data.agentes);
    const resolvedClient = $derived(data.clientData);

    const activeClient = $derived.by(() => {
        const storeId = $selectedClient;
        if (storeId && page.data.clientes) {
            const foundInCache = page.data.clientes.find((c: any) => c.id === storeId);
            if (foundInCache) return foundInCache;
        }
        return resolvedClient;
    });

    function closeCard(e: MouseEvent) {
        // Limpiamos el store, el href nativo se encargará de navegar a /clientes
        selectedClient.clear(); 
    }
</script>

<div class="view-container">
    {#if activeClient}
        <div class="card-full" transition:slide>
            <header>
                <a href="/clientes" class="close" onclick={closeCard} aria-label="Cerrar">✕</a>
                
                <h1>{activeClient.razon_social}</h1>
                
                <div class="meta">
                    <p>
                        <span style="color:{activeClient.id_contpaqi ? 'green' : 'red'}">
                            {activeClient.id_contpaqi ? 'Sincronizado' : 'Sin sincronizar'}
                        </span> con Contpaqi
                    </p>
                    <p>ID: <strong>{activeClient.id}</strong></p>
                </div>
            </header>
    
            <div class="content">
                <div class="info">
                    <EditableField
                        label="Razón Social"
                        name="razon_social"
                        value={activeClient.razon_social}
                        id={activeClient.id}
                        action="?/updateClient"
                        placeholder="Nombre de la empresa"
                    />
    
                    <EditableField
                        label="Estado"
                        name="estado"
                        type="text"
                        value={activeClient.estado}
                        id={activeClient.id}
                        action="?/updateClient"
                        placeholder="Estado de la republica"
                    />
                    <EditableField
                        label="Ciudad"
                        name="ciudad"
                        type="text"
                        value={activeClient.ciudad}
                        id={activeClient.id}
                        action="?/updateClient"
                        placeholder="Ciudad"
                    />
                    <EditableField
                        label="Sector"
                        name="sector"
                        type="text"
                        value={activeClient.sector}
                        id={activeClient.id}
                        action="?/updateClient"
                        placeholder="Sector economico"
                    />
                    
                    {#if $profile?.isAdmin}
                        <EditableSelectField
                            label="Agente"
                            name="id_agente"
                            id={activeClient.id}
                            value={activeClient.id_agente}
                            options={agentes}
                            action="?/updateClient"
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
                        jsonList={activeClient.contactos}
                        id={activeClient.id}
                        action="?/updateClient"
                    />
                </div>
                
                <div class="system">
                    <div class="detail-block">
                        <span class="label">Tipo de Prospección:</span>
                        <p class="value">{activeClient.tipo_prospeccion || 'Cartera de clientes original'}</p>
                    </div>
                    
                    <div class="detail-block">
                        <span class="label">Fecha de creación:</span>
                        <p class="value">
                            {activeClient.fecha_creacion 
                                ? new Date(activeClient.fecha_creacion).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
                                : 'N/A'}
                        </p>
                    </div>
    
                    <div class="detail-block">
                        <span class="label">Última actualización:</span>
                        <p class="value">
                            {activeClient.ultima_actualizacion
                                ? new Date(activeClient.ultima_actualizacion).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                : 'N/A'}
                        </p>
                    </div>
    
                    {#if activeClient.fecha_sync}
                        <div class="detail-block">
                            <span class="label">Última sincronización:</span>
                            <p class="value">
                                {new Date(activeClient.fecha_sync).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
	header {
		display: flex;
		gap: var(--a);
		position: relative;
		flex-direction: column;
		justify-content: space-between;
		align-items: flex-start;
		background-color: var(--color-primary);
		backdrop-filter: blur(16px);
		padding: var(--a);

		position: sticky;
		top: 0;
		z-index: 99;
	}
	.meta {
		display: flex;
		gap: var(--a);
	}
	.close {
		position: absolute;
		top: 0;
		right: 0;
		background: transparent;
		border: none;
		padding: 0 var(--a);
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.2s;
		flex-shrink: 0;
		cursor: pointer;
		text-decoration: none;
	}
	.meta {
		display: flex;
		gap: var(--a);
	}

	header {
		display: flex;
		gap: var(--a);
		position: relative;
		flex-direction: column;
		justify-content: space-between;
		align-items: flex-start;
		background-color: var(--color-primary);
		backdrop-filter: blur(16px);
		padding: var(--a);
		position: sticky;
		top: 0;
		z-index: 99;
	}
	.meta {
		display: flex;
		gap: var(--a);
		flex-wrap: wrap;
		font-size: 14px;
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: var(--a);
		padding: var(--a);
		overflow-y: auto;
	}

	.info {
		display: flex;
		flex-direction: column;
		gap: var(--d);
		padding: var(--b) var(--a);
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
	}

	.detail-block {
		display: flex;
		flex-direction: column;
		gap: var(--a);
	}
	.detail-block .detail-body .value {
		padding-left: var(--b);
		display: flex;
		gap: var(--a);
		flex-wrap: wrap;
	}
	.system {
		display: flex;
		gap: var(--b);
		flex-direction: row;
		flex-wrap: wrap;
		border-top: 1px solid var(--color-secondary);
		padding: var(--a);
	}
</style>
