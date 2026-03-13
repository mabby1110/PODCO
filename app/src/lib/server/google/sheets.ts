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

export async function appendRow(
	range: string = 'historial_actividades!A:C',
	values: any[],
	prefix: string = 'BMS'
) {
	const id = generateId(prefix);

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