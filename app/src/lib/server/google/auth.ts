import { google } from 'googleapis';
import { GOOGLE_APPLICATION_CREDENTIALS } from '$env/static/private';

const credentials = JSON.parse(GOOGLE_APPLICATION_CREDENTIALS);

export const auth = new google.auth.GoogleAuth({
	credentials,
	scopes: [
		// 'https://www.googleapis.com/auth/spreadsheets',
		'https://www.googleapis.com/auth/drive'
	]
});