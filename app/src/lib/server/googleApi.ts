import { google } from 'googleapis';
import { GOOGLE_APPLICATION_CREDENTIALS, GOOGLE_FOLDER_ID, GOOGLE_SHEET_ID } from '$env/static/private';
import { readFileSync } from 'fs';

import crypto from 'crypto';

const credentials = JSON.parse(GOOGLE_APPLICATION_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
	credentials,
	scopes: [
		'https://www.googleapis.com/auth/spreadsheets',
		'https://www.googleapis.com/auth/drive'
	]
});

// SHEETS
const sheets = google.sheets({ version: 'v4', auth });

export function generateId(prefix = 'BMS') {
	const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
	const hash = crypto.randomBytes(4).toString('hex');
	return `${prefix}-${date}-${hash}`;
}

export function makeJson(data: any[][] | null | undefined): Record<string, any>[] {
    if (!data || data.length === 0) {
        return [];
    }

    // Extraer encabezados y filas de datos
    const headers = data[0];
    const dataRows = data.slice(1);

    // Mapear las filas de datos a objetos JSON
    return dataRows.map(row => {
        const obj: Record<string, any> = {};
        headers.forEach((header: string, index: number) => {
            obj[header] = row[index] !== undefined ? row[index] : null;
        });
        return obj;
    });
}

export async function getRange(range: string = 'historial_actividades!A:C') {
	const response = await sheets.spreadsheets.values.get({
		spreadsheetId: GOOGLE_SHEET_ID,
		range
	});

	return makeJson(response.data.values) || [];
}

export async function deleteRowById(id: string, range: string = 'historial_actividades!A:C') {
	const values = await getRange(range);

	const rowIndex = values.findIndex((row) => row[0] === id);
	if (rowIndex === -1) {
		throw new Error(`No se encontró registro con ID: ${id}`);
	}

	const sheetName = range.split('!')[0];

	// obtener sheetId
	const meta = await sheets.spreadsheets.get({
		spreadsheetId: GOOGLE_SHEET_ID
	});

	const sheet = meta.data.sheets?.find((s) => s.properties?.title === sheetName);

	if (!sheet?.properties?.sheetId) {
		throw new Error(`No se encontró la hoja ${sheetName}`);
	}

	await sheets.spreadsheets.batchUpdate({
		spreadsheetId: GOOGLE_SHEET_ID,
		requestBody: {
			requests: [
				{
					deleteDimension: {
						range: {
							sheetId: sheet.properties.sheetId,
							dimension: 'ROWS',
							startIndex: rowIndex, // 0-based
							endIndex: rowIndex + 1
						}
					}
				}
			]
		}
	});

	return { deletedRow: rowIndex + 1 };
}

export async function updateRowById(
	id: string,
	newValues: { [key: string]: any },
	range: string = 'oportunidades!A:Z'
) {
	const values = await getRange(range); // Ya devuelve JSON, no array[][]
	// Buscar la fila por ID en la propiedad id_oportunidad
	const rowIndex = values.findIndex((row) => row.id === id);
	
	if (rowIndex === -1) {
		throw new Error(`No se encontró registro con ID: ${id}`);
	}
	
	const rowNumber = rowIndex + 2; // +1 por headers, +1 por índice base-0
	const sheetName = range.split('!')[0];
	
	// Preparar las actualizaciones para cada columna
	const data = Object.entries(newValues).map(([column, value]) => ({
		range: `${sheetName}!${column}${rowNumber}`,
		values: [[value]]
	}));

	// Actualizar en un solo batch
	await sheets.spreadsheets.values.batchUpdate({
		spreadsheetId: GOOGLE_SHEET_ID,
		requestBody: {
			valueInputOption: 'RAW',
			data
		}
	});

	return { rowNumber, updated: newValues };
}
// Tipo para el mapeo de campos a columnas
export type FieldColumnMap = {
  [fieldName: string]: string; // fieldName -> column letter
};

/**
 * Convierte FormData a un objeto de valores mapeados por columnas
 * @param formData - Los datos del formulario
 * @param fieldColumnMap - Mapeo de nombres de campos a letras de columnas
 * @returns Objeto con las columnas como keys y los valores del formData
 */
export function mapFormDataToColumns(
  formData: FormData,
  fieldColumnMap: FieldColumnMap
): { [key: string]: any } {
  const values: { [key: string]: any } = {};

  for (const [fieldName, columnLetter] of Object.entries(fieldColumnMap)) {
    if (formData.has(fieldName)) {
      values[columnLetter] = formData.get(fieldName);
    }
  }

  return values;
}
export async function appendRow(range: string = 'historial_actividades!A:C', values: any[]) {
	const id = generateId();

	const response = await sheets.spreadsheets.values.append({
		spreadsheetId: GOOGLE_SHEET_ID,
		range,
		valueInputOption: 'USER_ENTERED',
		requestBody: {
			values: [[id, ...values]]
		}
	});

	return { id, response: response.data };
}

export async function updatePhaseAndHistory(
	id: string,
	historia: string,
	action: string,
	nextPhase?: string,
	range: string = 'historial_actividades!A:Z'
) {
	console.log('updatePhaseAndHistory llamada con:', { id, historia, action, nextPhase, range });

	const values = await getRange(range);
	console.log('Total de filas obtenidas:', values.length);

	// Buscar la fila por ID
	const rowIndex = values.findIndex((row) => row[0] === id);

	if (rowIndex === -1) {
		throw new Error(`No se encontró oportunidad con ID: ${id}`);
	}

	const currentRow = values[rowIndex];
	console.log('Fila encontrada (índice ' + rowIndex + '):', currentRow);

	const rowNumber = rowIndex + 1;
	const sheetName = range.split('!')[0];

	// Timestamp para la historia
	const timestamp = new Date().toISOString();
	const newHistoryEntry = `[${timestamp}] ${action}: ${historia}`;

	// Obtener historia actual (columna I, índice 8)
	const currentHistory = currentRow[7] || '';
	const currentFase = currentRow[10] || '';
	console.log('Historia actual (columna I, índice 8):', currentHistory);

	const updatedHistory = currentHistory ? `${currentHistory}, ${newHistoryEntry}` : newHistoryEntry;

	console.log('Historia actualizada:', updatedHistory);

	// Preparar las actualizaciones
	const updates: { [key: string]: any } = {
		H: updatedHistory // Columna I (índice 8) - historia
	};

	updates.K = Number(nextPhase) + 1;
	console.log('Actualizando fase a:', updates.K);

	console.log('Updates a realizar:', updates);

	// Preparar datos para batchUpdate
	const data = Object.entries(updates).map(([column, value]) => ({
		range: `${sheetName}!${column}${rowNumber}`,
		values: [[value]]
	}));

	console.log('Datos batch:', data);

	// Actualizar en un solo batch
	await sheets.spreadsheets.values.batchUpdate({
		spreadsheetId: GOOGLE_SHEET_ID,
		requestBody: {
			valueInputOption: 'USER_ENTERED',
			data
		}
	});

	console.log('Actualización completada exitosamente');

	return {
		rowNumber,
		updated: updates,
		newHistoryEntry
	};
}

// DRIVE
const drive = google.drive({ version: 'v3', auth });

export async function uploadToFolder(
	filename: string,
	mimeType: string,
	body: NodeJS.ReadableStream
) {
	const response = await drive.files.create({
		requestBody: {
			name: filename,
			parents: [GOOGLE_FOLDER_ID] // This should be a folder ID in a shared drive
		},
		media: {
			mimeType,
			body
		},
		fields: 'id, name, webViewLink',
		supportsAllDrives: true // Add this parameter
	});

	return response.data;
}
