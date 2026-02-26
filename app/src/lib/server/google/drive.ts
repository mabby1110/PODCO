import { google } from 'googleapis';
import { auth } from './auth';
import { GOOGLE_FOLDER_ID } from '$env/static/private';

export const drive = google.drive({
	version: 'v3',
	auth
});

export async function uploadToFolder(
	filename: string,
	mimeType: string,
	body: NodeJS.ReadableStream
) {
	const response = await drive.files.create({
  requestBody: {
    name: filename,
    parents: [GOOGLE_FOLDER_ID] // carpeta dentro del Shared Drive
  },
  media: {
    mimeType,
    body
  },
  fields: 'id,name,webViewLink',
  supportsAllDrives: true
});
	return response.data;
}