import { clienteFieldMap, historialFieldMap, opFieldMap, type Cliente, type Historial } from '$lib';
import { processAttachments } from './google/drive';
import { appendRow, mapObjectToColumns, updateRowById } from './google/sheets';

// HISTORIAL
export async function registrarHistorial(historial: Historial) {
	// Mapeamos y enviamos a Google Sheets
	const mapHistorial = mapObjectToColumns(historial, historialFieldMap);
	const nuevoHistorial = await appendRow('historial!A:Z', mapHistorial, 'BMS_LOG');

	return nuevoHistorial.id;
}

// CLIENTES
export async function crearCliente(formData: FormData) {
	const getStr = (key: string) => (formData.get(key) as string) || '';

	// 1. Crear el objeto Cliente
	const cliente: Cliente = {
		fecha_creacion: new Date().toISOString(),
		id_agente: getStr('id_agente'),
		razon_social: getStr('razon_social'),
		nombre_comercial: getStr('nombre_comercial'),
		ubicacion: getStr('ubicacion'),
		estado: getStr('estado'),
		ciudad: getStr('ciudad'),
		sector: getStr('sector'),
		contactos: getStr('contactos'),
		tipo_prospeccion: getStr('tipo_prospeccion'),
		historial: getStr('historial')
	};

	const mapCliente = mapObjectToColumns(cliente, clienteFieldMap);
	const nuevoCliente = await appendRow('clientes!A:Z', mapCliente, 'BMS_CLI');

	// 2. Crear el registro en el Historial
	let historial: Historial = {
		fecha_creacion: new Date().toISOString(),
		id_agente: getStr('id_agente'),
		tipo_objeto: 'cliente',
		id_objeto: nuevoCliente.id,
		accion: 'create',
		cambios: JSON.stringify(Object.fromEntries(formData.entries()))
	};
	await registrarHistorial(historial);

	// 3. Retornamos el ID por si otra función lo necesita
	return nuevoCliente.id;
}

export async function actualizarCliente(id: string, formData: FormData) {
	// 1. Convertimos el formData a un objeto plano (lo guardamos en variable para reusarlo)
	const formatedFormData = Object.fromEntries(formData.entries());

	// 2. ACTUALIZAR CLIENTE
	const mapCliente = mapObjectToColumns(formatedFormData, clienteFieldMap);
	await updateRowById(id, mapCliente, 'clientes!A:Z');

	// 3. REGISTRAR HISTORIAL
	const historial: Historial = {
		fecha_creacion: new Date().toISOString(),
		id_agente: (formData.get('id_agente') as string) || '1',
		tipo_objeto: 'cliente',
		id_objeto: id,
		accion: 'update',
		cambios: JSON.stringify(formatedFormData)
	};

	await registrarHistorial(historial);

	return id;
}

// OPORTUNIDADES
export async function crearOportunidad(formData: FormData) {
	const getStr = (key: string) => (formData.get(key) as string) || '';
	console.log(formData);
	const oportunidad = {
		fecha_creacion: new Date().toISOString(),
		inicio: getStr('inicio'),
		fin: getStr('fin'),
		id_agente: getStr('id_agente'),
		fase: getStr('fase'),
		motivo: getStr('motivo'),
		motivo_inicial: getStr('motivo'),
		objetivo: getStr('objetivo'),
		requisitos: getStr('requisitos'),
		observaciones: getStr('observaciones'),
		necesidades: getStr('necesidades'),
		potencial_venta: getStr('potencial_venta'),
		id_cliente: getStr('id_cliente'),
		fecha_analisis: getStr('fecha_analisis')
	};

	const mapOportunidad = mapObjectToColumns(oportunidad, opFieldMap);
	const nuevaOp = await appendRow('oportunidades!A:AD', mapOportunidad, 'BMS_OP');

	// 2. Crear el registro en el Historial Global
	const historial: Historial = {
		fecha_creacion: new Date().toISOString(),
		id_agente: getStr('id_agente') || '1',
		tipo_objeto: 'oportunidad',
		id_objeto: nuevaOp.id,
		accion: 'create',
		cambios: JSON.stringify(Object.fromEntries(formData.entries()))
	};

	await registrarHistorial(historial);

	return nuevaOp.id;
}

export async function actualizarOportunidad(id: string, formData: FormData) {
	// 1. Extraemos todo el formData a un objeto plano
	// Usamos esto para mapear los campos básicos de texto
	const formatedFormData = Object.fromEntries(formData.entries());
	const newValues = mapObjectToColumns(formatedFormData, opFieldMap);

	// 2. Variables comunes para los archivos
	const agenteNombre = formData.get('agente') as string;
	const opFolder = `${id}`;

	// ---------- PROCESAMIENTO DE ARCHIVOS ----------
	// (Estos sobrescribirán los valores del mapObjectToColumns si se suben archivos nuevos)

	// COTIZACIONES PRESENTADAS (Columna R)
	if (formData.get('quoteFile')) {
		try {
			const quoteFiles = formData.getAll('quoteFile') as File[];
			const quotesRaw = formData.get('cotizaciones_presentadas');
			const updatedQuotes = await processAttachments(quoteFiles, agenteNombre, opFolder, quotesRaw);
			newValues['R'] = JSON.stringify(updatedQuotes);
		} catch (err) {
			console.error('Error procesando cotizaciones', err);
		}
	}

	// COTIZACIONES GANADAS (Columna S)
	if (formData.get('quoteWonFile')) {
		try {
			const quoteWonFiles = formData.getAll('quoteWonFile') as File[];
			const quotesWonRaw = formData.get('cotizaciones_ganadas');
			const updatedQuotesWon = await processAttachments(
				quoteWonFiles,
				agenteNombre,
				opFolder,
				quotesWonRaw
			);
			newValues['S'] = JSON.stringify(updatedQuotesWon);
		} catch (err) {
			console.error('Error procesando cotizaciones ganadas', err);
		}
	}

	// OC CLIENTE (Columna T)
	if (formData.get('ocFile')) {
		try {
			const ocFiles = formData.getAll('ocFile') as File[];
			const ocRaw = formData.get('oc_cliente');
			const updatedOC = await processAttachments(ocFiles, agenteNombre, opFolder, ocRaw);
			newValues['T'] = JSON.stringify(updatedOC);
		} catch (err) {
			console.error('Error procesando OC Cliente', err);
		}
	}

	// DOCUMENTOS (Columna I)
	if (formData.get('docFile')) {
		try {
			const docFiles = formData.getAll('docFile') as File[];
			const docsRaw = formData.get('documentos');
			const docs = await processAttachments(docFiles, agenteNombre, opFolder, docsRaw);
			newValues['I'] = JSON.stringify(docs);
		} catch (err) {
			console.error('Error procesando documentos', err);
		}
	}

	// DOCUMENTOS OPERACION (Columna U)
	if (formData.get('docOperFile')) {
		try {
			const docOperFiles = formData.getAll('docOperFile') as File[];
			const docsOpRaw = formData.get('documentos_operacion');
			const updatedDocsOp = await processAttachments(
				docOperFiles,
				agenteNombre,
				opFolder,
				docsOpRaw
			);
			newValues['U'] = JSON.stringify(updatedDocsOp);
		} catch (err) {
			console.error('Error procesando documentos de operacion', err);
		}
	}

	// 4. ---------- UPDATE SHEET OPORTUNIDADES ------------
	await updateRowById(id, newValues, 'oportunidades!A:AD');

	// 5. ---------- REGISTRO EN HISTORIAL GLOBAL ----------
	const historial: Historial = {
		fecha_creacion: new Date().toISOString(),
		id_agente: (formData.get('id_agente') as string) || '1',
		tipo_objeto: 'oportunidad',
		id_objeto: id,
		accion: 'update',
		// Guardamos todo lo que se envió en la petición
		cambios: JSON.stringify(formatedFormData)
	};

	await registrarHistorial(historial);

	return id;
}

// ACTIVIDADES