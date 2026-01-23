// src/lib/utils/cookies.ts
import { browser } from '$app/environment';

/**
 * Obtiene el valor de una cookie por su nombre
 */
export function getCookie(name: string): string | null {
	if (!browser) return null;
	
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	
	if (parts.length === 2) {
		const cookieValue = parts.pop()?.split(';').shift();
		return cookieValue ? decodeURIComponent(cookieValue) : null;
	}
	
	return null;
}

/**
 * Establece una cookie con opciones configurables
 */
export function setCookie(
	name: string,
	value: string,
	options: {
		maxAge?: number;
		expires?: Date;
		path?: string;
		domain?: string;
		secure?: boolean;
		sameSite?: 'Strict' | 'Lax' | 'None';
	} = {}
) {
	if (!browser) return;

	const {
		maxAge,
		expires,
		path = '/',
		domain,
		secure,
		sameSite = 'Lax'
	} = options;

	let cookie = `${name}=${encodeURIComponent(value)}`;

	if (maxAge !== undefined) {
		cookie += `; max-age=${maxAge}`;
	}

	if (expires) {
		cookie += `; expires=${expires.toUTCString()}`;
	}

	cookie += `; path=${path}`;

	if (domain) {
		cookie += `; domain=${domain}`;
	}

	if (secure) {
		cookie += '; secure';
	}

	cookie += `; SameSite=${sameSite}`;

	document.cookie = cookie;
}

/**
 * Elimina una cookie
 */
export function deleteCookie(name: string, path: string = '/') {
	if (!browser) return;
	document.cookie = `${name}=; max-age=0; path=${path}; SameSite=Lax`;
}

/**
 * Guarda un objeto como JSON en una cookie
 */
export function setCookieJSON<T>(
	name: string,
	value: T,
	options: {
		maxAge?: number;
		expires?: Date;
		path?: string;
		domain?: string;
		secure?: boolean;
		sameSite?: 'Strict' | 'Lax' | 'None';
	} = {}
) {
	try {
		const jsonString = JSON.stringify(value);
		setCookie(name, jsonString, options);
	} catch (error) {
		console.error(`Error saving JSON to cookie "${name}":`, error);
	}
}

/**
 * Obtiene un objeto desde una cookie JSON
 */
export function getCookieJSON<T>(name: string): T | null {
	const cookieValue = getCookie(name);
	
	if (!cookieValue) return null;

	try {
		return JSON.parse(cookieValue) as T;
	} catch (error) {
		console.error(`Error parsing JSON from cookie "${name}":`, error);
		deleteCookie(name);
		return null;
	}
}

/**
 * Verifica si una cookie existe
 */
export function cookieExists(name: string): boolean {
	return getCookie(name) !== null;
}

/**
 * Obtiene todas las cookies como un objeto
 */
export function getAllCookies(): Record<string, string> {
	if (!browser) return {};

	const cookies: Record<string, string> = {};
	const cookieArray = document.cookie.split(';');

	for (const cookie of cookieArray) {
		const [name, value] = cookie.trim().split('=');
		if (name && value) {
			cookies[name] = decodeURIComponent(value);
		}
	}

	return cookies;
}