import { google } from 'googleapis';
import { auth } from './auth';
import { GOOGLE_FOLDER_ID } from '$env/static/private';
import { Readable } from 'stream';

export const drive = google.drive({
	version: 'v3',
	auth
});

const FOLDER_MIME = 'application/vnd.google-apps.folder';

/**
 * Busca una carpeta por nombre dentro de un parent.
 * Si no existe → la crea.
 */
async function getOrCreateFolder(name: string, parentId: string) {
	const query = [
		`name='${name.replace(/'/g, "\\'")}'`,
		`'${parentId}' in parents`,
		`mimeType='${FOLDER_MIME}'`,
		'trashed=false'
	].join(' and ');

	const res = await drive.files.list({
		q: query,
		fields: 'files(id,name)',
		supportsAllDrives: true,
		includeItemsFromAllDrives: true
	});

	if (res.data.files && res.data.files.length > 0) {
		return res.data.files[0].id as string;
	}

	const folder = await drive.files.create({
		requestBody: {
			name,
			mimeType: FOLDER_MIME,
			parents: [parentId]
		},
		fields: 'id',
		supportsAllDrives: true
	});

	return folder.data.id as string;
}

/**
 * Estructura:
 * ROOT
 *  └── BMS_2026
 *        └── AGENTE
 *              └── OPXXX
 */
async function resolveUploadFolder(
	agentName: string,
	opFolder: string
) {
	// nivel 1
	const yearFolderId = await getOrCreateFolder(
		'BMS_2026',
		GOOGLE_FOLDER_ID
	);

	// nivel 2
	const agentFolderId = await getOrCreateFolder(
		agentName,
		yearFolderId
	);

	// nivel 3
	const opFolderId = await getOrCreateFolder(
		opFolder,
		agentFolderId
	);

	return opFolderId;
}

/**
 * Upload final
 */
export async function uploadToFolder(
	filename: string,
	mimeType: string,
	body: NodeJS.ReadableStream,
	agentName: string,
	opFolder: string
) {
	const folderId = await resolveUploadFolder(agentName, opFolder);

	const response = await drive.files.create({
		requestBody: {
			name: filename,
			parents: [folderId]
		},
		media: {
			mimeType,
			body
		},
		fields: 'id,name,webViewLink',
		supportsAllDrives: true
	});

	const fileId = response.data.id as string;

	// ✅ hacer público como reader
	await drive.permissions.create({
		fileId,
		requestBody: {
			role: 'reader',
			type: 'anyone'
		},
		supportsAllDrives: true
	});

	return response.data;
}

export async function processAttachments(
	files: File[],
	agenteNombre: string,
	opFolder: string,
	existingJson?: FormDataEntryValue | null
) {
	let docs: any[] = [];

	// parse existing
	if (existingJson && String(existingJson).trim() !== '') {
		try {
			docs = JSON.parse(existingJson as string);
			if (!Array.isArray(docs)) docs = [];
		} catch {
			docs = [];
		}
	}

	for (const file of files) {
		if (!file || file.size === 0) continue;

		const buffer = Buffer.from(await file.arrayBuffer());
		const stream = Readable.from(buffer);

		const uploaded = await uploadToFolder(
			file.name,
			file.type,
			stream,
			agenteNombre,
			opFolder
		);

		if (uploaded?.webViewLink) {
			docs.push({
				name: uploaded.name,
				url: uploaded.webViewLink,
				preview: `https://drive.google.com/file/d/${uploaded.id}/preview`
			});
		}
	}

	return docs;
}