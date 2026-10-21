import type {
	Actividad,
	Cliente,
	Cotizacion,
	Historial,
	Notificacion,
	Oportunidad,
	Pedido
} from '$lib';
import { subirAGoogleDrive } from '../google/drive';
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
	'observaciones',
	'giro_comercial',
	'clasificacion'
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
	'observaciones',
	'id_oportunidad'
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
	'documentos_operacion',
	'id_actividad'
];

const CLAVES_PEDIDO: (keyof Pedido)[] = [
	'id',
	'fecha_creacion',
	'inicio',
	'fin',
	'fecha_cierre',
	'id_agente',
	'fase',
	'historia',
	'observaciones',
	'fecha_pedido',
	'fecha_reconocimiento',
	'fecha_recepcion',
	'total',
	'no_orden',
	'id_oportunidad',
	'id_producto',
	'cantidad',
	'stock',
	'precio_unitario',
	'id_agrupacion',
	'id_cotizacion',
	'id_occ',
	'estatus'
];

const CLAVES_HISTORIAL: (keyof Historial)[] = [
	'id',
	'fecha_creacion',
	'id_agente',
	'tipo_objeto',
	'id_objeto',
	'accion',
	'cambios'
];

const CLAVES_NOTIFICACIONES: (keyof Notificacion)[] = [
	'id',
	'fecha_creacion',
	'id_agente',
	'id_historial',
	'visto',
	'fecha_lectura'
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

export function construirDatosPedido(data: Record<string, any>, id?: string): Partial<Pedido> {
	const datosBrutos: Partial<Pedido> = {};
	for (const clave of CLAVES_PEDIDO) {
		// Asignación de ID
		if (clave === 'id') {
			datosBrutos.id = id ? id : generateId('BMS-PD');
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
		if (clave === 'fase' && data.fase !== undefined) {
			datosBrutos.fase = data.fase ? Number(data.fase) : 1;
			continue;
		}

		// manejo para json
		// if (clave === 'historia' && data.historia !== undefined) {
		// 	datosBrutos.historia = data.historia === 'string' ? JSON.parse(data.historia) : data.historia;
		// 	continue;
		// }
		// Asignación del resto si existen
		if (data[clave] !== undefined) {
			(datosBrutos as any)[clave] = data[clave];
		}
	}

	return limpiarCamposVacios(datosBrutos) as Partial<Pedido>;
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
		if (clave === 'fecha_cierre' && !data.fecha_cierre) {
			datosBrutos.fecha_cierre = new Date().toISOString();
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

export async function procesarDocumentos(formData: FormData) {
	const nombre_agente = formData.get('nombre_agente')?.toString() || '';
	const nombre_cliente = formData.get('nombre_cliente')?.toString() || '';
	const id_oportunidad = formData.get('id_oportunidad')?.toString() || '';
	const tipo = formData.get('tipo')?.toString() || '';
	const docFiles = formData.getAll(tipo) as File[];

	console.log(docFiles, id_oportunidad, nombre_agente, nombre_cliente, tipo);

	if (!id_oportunidad || docFiles.length === 0) {
		return [];
	}

	const opFolder = `${id_oportunidad}`;
	const clientFolder = `${nombre_cliente}`;

	try {
		const docs = await subirAGoogleDrive(docFiles, nombre_agente, opFolder, clientFolder);

		return docs.map((doc) => ({
			id: generateId('BMS-Q'),
			id_oportunidad: id_oportunidad,
			titulo: doc.name || 'sin_titulo',
			url: doc.url,
			preview: doc.preview
		}));
	} catch (err) {
		console.error('Error procesando documentos:', err);
		throw new Error('Fallo crítico al procesar y subir adjuntos');
	}
}

export async function procesarCotizacion(formData: FormData) {
	const docFiles = formData.getAll('docs_adjuntos') as File[];
	const nombre_agente = formData.get('nombre_agente')?.toString() || '';
	const nombre_cliente = formData.get('nombre_cliente')?.toString() || '';
	const id_oportunidad = formData.get('id_oportunidad')?.toString() || '';

	if (!id_oportunidad || docFiles.length === 0) {
		return [];
	}

	const iniciales = nombre_agente
		.trim()
		.split(/\s+/)
		.map((palabra) => palabra[0])
		.join('')
		.toUpperCase();

	const sufijoId = id_oportunidad.split('-').pop() || id_oportunidad;
	const nombreClienteLimpio = nombre_cliente.trim().replace(/\s+/g, '_');

	const opFolder = `${iniciales}_${sufijoId}_${nombreClienteLimpio}`;

	try {
		const docs = await subirAGoogleDrive(docFiles, nombre_agente, opFolder);

		return docs.map((doc) => ({
			id: generateId('BMS-DOC'),
			id_oportunidad: id_oportunidad,
			titulo: doc.name || 'sin_titulo',
			url: doc.url,
			preview: doc.preview
		}));
	} catch (err) {
		console.error('Error procesando documentos:', err);
		throw new Error('Fallo crítico al procesar y subir adjuntos');
	}
}
