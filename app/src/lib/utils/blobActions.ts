export function exportarCSV(datos: Record<string, any>[], nombreArchivo: string = 'exportacion.csv'): void {
    if (!datos || datos.length === 0) return;

    const cabeceras = Object.keys(datos[0]);
    
    const filasCSV = [
        cabeceras.join(','),
        ...datos.map(fila => 
            cabeceras.map(campo => {
                const valor = fila[campo];
                const texto = typeof valor === 'object' && valor !== null 
                    ? JSON.stringify(valor) 
                    : String(valor ?? '');
                
                const escapado = texto.replace(/"/g, '""');
                return `"${escapado}"`;
            }).join(',')
        )
    ];

    const contenidoCSV = filasCSV.join('\n');
    
    // Se añade '\uFEFF' al inicio para forzar a Excel y otros lectores a interpretar UTF-8 de forma correcta
    const blob = new Blob(['\uFEFF' + contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    
    URL.revokeObjectURL(url);
}