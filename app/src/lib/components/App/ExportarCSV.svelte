<script lang="ts">
    import { page } from '$app/state';

    let { lista_ordenada, titulo } = $props<{
        lista_ordenada: Record<string, any>[];
        titulo?: string;
    }>();

    function exportarACSV(): void {
        if (!lista_ordenada || lista_ordenada.length === 0) return;

        const nombreBase =
            titulo?.trim() || page.url.pathname.split('/').filter(Boolean).pop() || 'exportacion';
        const nombreArchivo = `${nombreBase.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`;

        const cabeceras = Object.keys(lista_ordenada[0]);

        const filasCSV = [
            cabeceras.join(','),
            ...lista_ordenada.map((fila) =>
                cabeceras
                    .map((campo) => {
                        const valor = fila[campo];
                        const texto =
                            typeof valor === 'object' && valor !== null
                                ? JSON.stringify(valor)
                                : String(valor ?? '');

                        const escapado = texto.replace(/"/g, '""');
                        return `"${escapado}"`;
                    })
                    .join(',')
            )
        ];

        const contenidoCSV = filasCSV.join('\n');
        const blob = new Blob(['\uFEFF' + contenidoCSV], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = nombreArchivo;
        link.click();

        URL.revokeObjectURL(url);
    }
</script>

<button
    type="button"
    class="butter btn-exportar"
    disabled={!lista_ordenada || lista_ordenada.length === 0}
    onclick={exportarACSV}
>
    <img src="/export-table.svg" alt="options" />
    <span class="cantidad">
        {lista_ordenada?.length || 0}
    </span>
</button>

<style>
    .btn-exportar {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2px 4px;
    }
	.btn-exportar img {
		height: 100%;
		aspect-ratio: 1 / 1;
	}
    .btn-exportar .cantidad {
        position: absolute;
        bottom: -5px;
        right: -4px;
        font-size: 0.65rem;
        opacity: 0.7;
        line-height: 1;
        pointer-events: none;
    }
    .btn-exportar:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>