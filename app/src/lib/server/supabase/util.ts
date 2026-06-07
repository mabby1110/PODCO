import type { Cliente } from '$lib';
import { generateId } from '../google/sheets';

export function construirDatosOportunidad(data: Record<string, any>, id?: string) {
	// Retornamos un objeto limpio y formateado listo para Supabase
	const oportunidad = {
		id: id ? id : generateId('BMS-OP'),

		// del sistema
		fecha_creacion: data['fecha_creacion']
			? (data['fecha_creacion'] as string)
			: new Date().toISOString(),
		historial_cambios: data['historial_cambios'] as string,
		inicio: data['inicio'] as string,
		fin: data['fin'] as string,
		fecha_cierre: data['fecha_cierre'] as string,
		fase: data['fase'] ? Number(data['fase']) : 1, // Convertimos a número
		documentos: data['documentos'] as string,

		// de la actividad
		historia: data['historia'] as string,
		motivo: data['motivo'] as string,
		objetivo: data['objetivo'] as string,
		requisitos: data['requisitos'] as string,
		observaciones: data['observaciones'] as string,

		// de la oportunidad
		necesidades: data['necesidades'] as string,
		potencial_venta: data['potencial_venta'] as string,
		id_cliente: data['id_cliente'] ? (data['id_cliente'] as string) : null,
		id_agente: data['id_agente'] ? (data['id_agente'] as string) : null,
		cotizaciones_presentadas: data['cotizaciones_presentadas'] || null,
		cotizaciones_ganadas: data['cotizaciones_ganadas'] || null,
		oc_cliente: data['oc_cliente'] || null,
		documentos_operacion: data['documentos_operacion'] || null
	};

	// (Opcional) Limpiamos las propiedades que sean "undefined" para que Supabase use
	// los valores por defecto de la base de datos si algún campo no venía en el formulario.
	Object.keys(oportunidad).forEach((key) => {
		if (oportunidad[key as keyof typeof oportunidad] === undefined) {
			delete oportunidad[key as keyof typeof oportunidad];
		}
	});

	return oportunidad;
}
export function construirDatosCliente(data: Record<string, any>, id?: string): Partial<Cliente> {
    const datosBrutos = {
        id: id ? id : generateId('BMS-CLI'),
        id_agente: data['id_agente'] as string,
        razon_social: data['razon_social'] as string,
        nombre_comercial: data['nombre_comercial'] as string,
        ubicacion: data['ubicacion'] as string,
        estado: data['estado'] as string,
        ciudad: data['ciudad'] as string,
        sector: data['sector'] as string,
        tipo_prospeccion: data['tipo_prospeccion'] as string,
        contactos: data['contactos'] ? JSON.stringify(data['contactos']) : undefined,
        historial: data['historial'] as string,
        observaciones: data['observaciones'] as string,
        // Asignamos fecha de creación si es nuevo, o actualización si ya existe
        fecha_creacion: !id ? new Date().toISOString() : undefined
    };
    return limpiarCamposVacios(datosBrutos) as Partial<Cliente>;
}

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
