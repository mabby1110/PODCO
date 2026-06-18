import type { Actividad, Cliente, Cotizacion, Oportunidad } from '$lib';
import { processAttachments } from '../google/drive';
import { generateId } from '../google/sheets';

const CLAVES_CLIENTE: (keyof Cliente)[] = [
	'id',
	'fecha_creacion',
	'historial_cambios',
	'id_contpaqi',
	'id_agente',
	'razon_social',
	'nombre_comercial',
	'ubicacion',
	'estado',
	'ciudad',
	'sector',
	'contactos',
	'tipo_prospeccion',
	'ultima_actualizacion',
	'historial',
	'observaciones'
];

const CLAVES_ACTIVIDAD: (keyof Actividad)[] = [
	'id',
	'fecha_creacion',
	'historial_cambios',
	'inicio',
	'fin',
	'fecha_cierre',
	'id_agente',
	'fase',
	'documentos',
	'historia',
	'motivo',
	'objetivo',
	'requisitos',
	'observaciones'
];

const CLAVES_DOCUMENTO: (keyof Cotizacion)[] = [
	'id',
	'fecha_creacion',
	'titulo',
	'url',
	'preview',
	'id_agente',
	'id_cliente',
	'id_oportunidad',
	'id_actividad'
];

const CLAVES_OPORTUNIDAD: (keyof Oportunidad)[] = [
	'id',
	'id_agente',
	'fecha_creacion',
	'historial_cambios',
	'inicio',
	'fin',
	'fecha_cierre',
	'fase',
	'documentos',
	'historia',
	'motivo',
	'objetivo',
	'requisitos',
	'observaciones',
	'necesidades',
	'potencial_venta',
	'id_cliente',
	'cotizaciones_presentadas',
	'cotizaciones_ganadas',
	'oc_cliente',
	'documentos_operacion'
];

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

export function construirDatosCliente(data: Record<string, any>, id?: string): Partial<Cliente> {
	const datosBrutos: Partial<Cliente> = {};
	console.log('construir cliente');
	console.log(datosBrutos.contactos);

	// 2. Iteramos SOLO sobre las claves válidas de Cliente
	for (const clave of CLAVES_CLIENTE) {
		// Manejo especial para el ID
		if (clave === 'id') {
			datosBrutos.id = id ? id : generateId('BMS-CLI');
			continue;
		}
		// Manejo especial para los contactos
		if (clave === 'contactos' && data.contactos !== undefined) {
			datosBrutos.contactos = JSON.parse(data.contactos);
			continue;
		}

		// 3. Asignamos el resto de los datos SOLO si existen en 'data'
		if (data[clave] !== undefined) {
			// Usamos as any para evitar errores de tipado dinámico al asignar
			(datosBrutos as any)[clave] = data[clave];
		}
	}

	// 4. Retornamos pasándolo por tu función limpiadora
	return limpiarCamposVacios(datosBrutos) as Partial<Cliente>;
}

// --- FUNCIONES CONSTRUCTORAS ---
export function construirDatosActividad(
	data: Record<string, any>,
	id?: string
): Partial<Actividad> {
	const datosBrutos: Partial<Actividad> = {};

	for (const clave of CLAVES_ACTIVIDAD) {
		// Asignación de ID
		if (clave === 'id') {
			datosBrutos.id = id ? id : generateId('BMS-ACT'); // Ajusta el prefijo según tu estándar
			continue;
		}

		// Asignación de Fecha de Creación
		if (clave === 'fecha_creacion' && !data.fecha_creacion) {
			datosBrutos.fecha_creacion = new Date().toISOString();
			continue;
		}

		// Conversión de Fase a Número
		if (clave === 'fase') {
			datosBrutos.fase = data.fase ? Number(data.fase) : 1;
			continue;
		}

		// Asignación del resto si existen
		if (data[clave] !== undefined) {
			(datosBrutos as any)[clave] = data[clave];
		}
	}

	return limpiarCamposVacios(datosBrutos) as Partial<Actividad>;
}

export function construirDatosOportunidad(
	data: Record<string, any>,
	id?: string
): Partial<Oportunidad> {
	const datosBrutos: Partial<Oportunidad> = {};

	for (const clave of CLAVES_OPORTUNIDAD) {
		// Asignación de ID
		if (clave === 'id') {
			datosBrutos.id = id ? id : generateId('BMS-OP');
			continue;
		}

		// Asignación de id_agente
		if (clave === 'id_agente') {
			datosBrutos.id_agente = data.id_agente ?? null;
			continue;
		}

		// Asignación de Fecha de Creación
		if (clave === 'fecha_creacion' && !data.fecha_creacion) {
			datosBrutos.fecha_creacion = new Date().toISOString();
			continue;
		}

		// Conversión de Fase a Número
		if (clave === 'fase' && datosBrutos.fase) {
			datosBrutos.fase = data.fase ? Number(data.fase) : 1;
			continue;
		}

		// manejo para json
		if (clave === 'historia' && data.historia !== undefined) {
			datosBrutos.historia = data.historia === 'string' ? JSON.parse(data.historia) : data.historia;
			continue;
		}
		// Asignación del resto si existen
		if (data[clave] !== undefined) {
			(datosBrutos as any)[clave] = data[clave];
		}
	}

	return limpiarCamposVacios(datosBrutos) as Partial<Oportunidad>;
}

export async function procesarDocumentos(
	formData: FormData,
	id_nodo_p: string, // padre
	archivo: string = 'adjuntos'
): Promise<Partial<Cotizacion>[]> {
	// Modificado: Retorna un array
	const baseDatos: Partial<Cotizacion> = {};

	// 1. Construir datos compartidos 
	for (const clave of CLAVES_DOCUMENTO) {
		if (clave === 'id') continue; // Se asignará individualmente

		if (formData.has(clave)) {
			const valor = formData.get(clave);
			(baseDatos as any)[clave] = valor !== '' ? valor : null;
		}
	}

	const datosLimpios = limpiarCamposVacios(baseDatos);

	// 2. Procesar archivos e iterar para subir a drive
	const quoteFile = formData.get(archivo) as File | null;

	if (quoteFile && quoteFile.size > 0) {
		try {
			const docFiles = formData.getAll(archivo) as File[];
			const agenteNombre = formData.get('agente') as string;
			const opFolder = `${id_nodo_p}`;

			const docs: any[] = await processAttachments(docFiles, agenteNombre, opFolder);

			// Generar un documento completo por cada archivo procesado
			return docs.map((doc) => ({
				...datosLimpios,
				id: generateId('BMS-DOC'),
				titulo: doc.name ?? 'sin titulo',
				url: doc.url,
				preview: doc.preview
			}));
		} catch (err) {
			console.error('Error procesando documentos', err);
			throw new Error('Fallo al procesar adjuntos');
		}
	}

	// 3. Fallback: Retornar array con un solo documento si no se subieron archivos
	return [
		{
			...datosLimpios,
			id: generateId('BMS-DOC')
		}
	];
}
