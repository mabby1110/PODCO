import type { Cliente } from '$lib';
import { generateId } from '../google/sheets';

/**
 * Itera sobre un objeto y elimina las propiedades que sean undefined, null,
 * strings vacíos, arreglos vacíos u objetos sin llaves.
 */
export function limpiarCamposVacios(obj: Record<string, any>): Record<string, any> {
	// Creamos una copia para no mutar el objeto original
	const resultado = { ...obj };

	Object.keys(resultado).forEach((key) => {
		const valor = resultado[key];

		// 1. Validar nulos o indefinidos
		if (valor === undefined || valor === null) {
			delete resultado[key];
		}
		// 2. Validar strings vacíos (incluso si solo tienen espacios)
		else if (typeof valor === 'string' && valor.trim() === '') {
			delete resultado[key];
		}
		// 3. Validar arreglos vacíos (ej. contactos: [])
		else if (Array.isArray(valor) && valor.length === 0) {
			delete resultado[key];
		}
		// 4. Validar objetos vacíos (ej. {})
		else if (
			typeof valor === 'object' &&
			!Array.isArray(valor) &&
			Object.keys(valor).length === 0
		) {
			delete resultado[key];
		}
	});

	return resultado;
}

export function construirDatosOportunidad(data: Record<string, any>, id?: string) {
    // 1. Extraemos los campos que necesitan conversión, lógica especial, 
    // o que NO queremos que lleguen a la base de datos por accidente.
    // (Aislo 'id_oportunidad' asumiendo que tu formulario lo envía como un input oculto)
    const { 
        id_oportunidad, 
        fase, 
        fecha_creacion, 
        ...restoDeDatos 
    } = data;

    // 2. Construimos los datos en bruto
    const datosBrutos = {
        // Esparcimos todos los demás campos (historia, motivo, necesidades, id_cliente, etc.)
        ...restoDeDatos,

        // Sobrescribimos y aplicamos la lógica a los campos especiales
        id: id ? id : generateId('BMS-OP'),
        fecha_creacion: fecha_creacion ? (fecha_creacion as string) : new Date().toISOString(),
        fase: fase ? Number(fase) : 1,
    };

    // 3. Pasamos por nuestra función limpiadora externa. 
    // Esto reemplaza tu bucle (Object.keys(oportunidad).forEach...)
    return limpiarCamposVacios(datosBrutos);
}

export function construirDatosCliente(data: Record<string, any>, id?: string): Partial<Cliente> {
    // 1. Aislamos los campos que NO queremos en la BD (como id_cliente)
    // y agrupamos todo lo demás en la variable "restoDeDatos"
    const { id_cliente, contactos, ...restoDeDatos } = data; 
    
    const datosBrutos = {
        // 2. Esparcimos solo el resto de los datos (ya no incluye id_cliente)
        ...restoDeDatos, 
        
        // 3. Asignamos los campos calculados/especiales
        id: id ? id : generateId('BMS-CLI'),
        contactos: contactos ? JSON.parse(contactos as string) : undefined
    };

    return limpiarCamposVacios(datosBrutos) as Partial<Cliente>;
}
