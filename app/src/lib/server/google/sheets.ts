import { google } from 'googleapis';
import { GOOGLE_SHEET_ID } from '$env/static/private';
import { auth } from './auth';
import crypto from 'crypto';

// ======================
// CLIENT
// ======================

export const sheets = google.sheets({
	version: 'v4',
	auth
});

// ======================
// HELPERS
// ======================

export function generateId(prefix = 'BMS') {
	const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
	const hash = crypto.randomBytes(4).toString('hex');
	return `${prefix}-${date}-${hash}`;
}

export function makeJson(data: any[][] | null | undefined): Record<string, any>[] {
	if (!data || data.length === 0) return [];

	const headers = data[0];
	const dataRows = data.slice(1);

	return dataRows.map((row) => {
		const obj: Record<string, any> = {};
		headers.forEach((header: string, index: number) => {
			obj[header] = row[index] !== undefined ? row[index] : null;
		});
		return obj;
	});
}

// ======================
// READ
// ======================

export async function getRange(range: string = 'historial_actividades!A:C') {
	const response = await sheets.spreadsheets.values.get({
		spreadsheetId: GOOGLE_SHEET_ID,
		range
	});

	return makeJson(response.data.values) || [];
}

// ======================
// DELETE ROW
// ======================

export async function deleteRowById(
	id: string,
	range: string = 'historial_actividades!A:C'
) {
	const values = await getRange(range);

	const rowIndex = values.findIndex((row) => row[0] === id);
	if (rowIndex === -1) {
		throw new Error(`No se encontró registro con ID: ${id}`);
	}

	const sheetName = range.split('!')[0];

	const meta = await sheets.spreadsheets.get({
		spreadsheetId: GOOGLE_SHEET_ID
	});

	const sheet = meta.data.sheets?.find(
		(s) => s.properties?.title === sheetName
	);

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
							startIndex: rowIndex,
							endIndex: rowIndex + 1
						}
					}
				}
			]
		}
	});

	return { deletedRow: rowIndex + 1 };
}

// ======================
// UPDATE ROW
// ======================

export async function updateRowById(
	id: string,
	newValues: { [key: string]: any },
	range: string = 'oportunidades!A:Z'
) {
	const values = await getRange(range);

	const rowIndex = values.findIndex((row) => row.id === id);

	if (rowIndex === -1) {
		throw new Error(`No se encontró registro con ID: ${id}`);
	}

	const rowNumber = rowIndex + 2;
	const sheetName = range.split('!')[0];

	const data = Object.entries(newValues).map(([column, value]) => ({
		range: `${sheetName}!${column}${rowNumber}`,
		values: [[value]]
	}));

	await sheets.spreadsheets.values.batchUpdate({
		spreadsheetId: GOOGLE_SHEET_ID,
		requestBody: {
			valueInputOption: 'USER_ENTERED',
			data
		}
	});

	return { rowNumber, updated: newValues };
}


// ======================
// APPEND
// ======================

// export async function appendRow(
// 	range: string = 'historial_actividades!A:C',
// 	values: any[],
// 	prefix: string = 'BMS'
// ) {
// 	const id = generateId(prefix);

// 	const response = await sheets.spreadsheets.values.append({
// 		spreadsheetId: GOOGLE_SHEET_ID,
// 		range,
// 		valueInputOption: 'USER_ENTERED',
// 		requestBody: {
// 			values: [[id, ...values]]
// 		}
// 	});

// 	return { id, response: response.data };
// }
// 1. Función auxiliar para calcular índices (A=0, Z=25, AA=26, etc.)
function colToIndex(colLetter: string): number {
    let index = 0;
    for (let i = 0; i < colLetter.length; i++) {
        // Multiplicamos por 26 por cada nueva letra y sumamos el valor de la letra actual (A=1, B=2)
        index = index * 26 + colLetter.toUpperCase().charCodeAt(i) - 64;
    }
    return index - 1; // Restamos 1 para que 'A' sea el índice 0
}

export async function appendRow(
    range: string = 'historial_actividades!A:C',
    data: { [key: string]: any }, 
    prefix: string = 'BMS'
) {
    const id = generateId(prefix);
    
    // 2. Inicializamos el arreglo. La posición 0 (Columna A) siempre es nuestro ID.
    const rowValues: any[] = [];
    rowValues[0] = id;

    // 3. Acomodamos cada valor en su posición exacta sin importar si es Z o ZZZ
    for (const [colLetter, val] of Object.entries(data)) {
        const index = colToIndex(colLetter);
        
        // Evitamos sobreescribir la columna A (índice 0) por accidente
        if (index > 0) {
            rowValues[index] = val;
        }
    }

    // 4. Rellenamos los huecos vacíos con strings en blanco
    for (let i = 0; i < rowValues.length; i++) {
        if (rowValues[i] === undefined) {
            rowValues[i] = "";
        }
    }

    // 5. Enviamos a Google Sheets
    const response = await sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [rowValues]
        }
    });

    return { id, response: response.data };
}
// ======================
// FORM MAPPING
// ======================

export type FieldColumnMap = {
	[fieldName: string]: string;
};

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
export function mapObjectToColumns(
    data: Record<string, any>, // Solo acepta objetos planos
    fieldColumnMap: Record<string, string>
): { [key: string]: any } {
    const values: { [key: string]: any } = {};

    for (const [fieldName, columnLetter] of Object.entries(fieldColumnMap)) {
        // Buscamos si la llave existe en el objeto
        if (fieldName in data) {
            values[columnLetter] = data[fieldName];
        }
    }

    return values;
}
// ======================
// UPDATE PHASE + HISTORY
// ======================

export async function updatePhaseAndHistory(
	id: string,
	historia: string,
	action: string,
	nextPhase?: number,
	range: string = 'historial_actividades!A:Z'
) {
	const values = await getRange(range);

	const rowIndex = values.findIndex((row) => row[0] === id);

	if (rowIndex === -1) {
		throw new Error(`No se encontró oportunidad con ID: ${id}`);
	}

	const currentRow = values[rowIndex];
	const rowNumber = rowIndex + 1;
	const sheetName = range.split('!')[0];

	const timestamp = new Date().toISOString();
	const newHistoryEntry = `[${timestamp}] ${action}: ${historia}`;

	const currentHistory = currentRow[7] || '';

	const updatedHistory = currentHistory
		? `${currentHistory}, ${newHistoryEntry}`
		: newHistoryEntry;

	const updates: { [key: string]: any } = {
		H: updatedHistory
	};

	if (nextPhase !== undefined) {
		updates.K = Number(nextPhase) + 1;
	}

	const data = Object.entries(updates).map(([column, value]) => ({
		range: `${sheetName}!${column}${rowNumber}`,
		values: [[value]]
	}));

	await sheets.spreadsheets.values.batchUpdate({
		spreadsheetId: GOOGLE_SHEET_ID,
		requestBody: {
			valueInputOption: 'USER_ENTERED',
			data
		}
	});

	return {
		rowNumber,
		updated: updates,
		newHistoryEntry
	};
}