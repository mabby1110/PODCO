// lib/utils/agenda.ts

/**
 * Obtiene las fechas de la semana basándose en un offset
 * @param offset - Número de semanas a desplazar (0 = semana actual, 1 = siguiente, -1 = anterior)
 */
export function getWeekDates(offset: number = 0): Date[] {
	const now = new Date();
	now.setHours(0, 0, 0, 0);
	const dayOfWeek = now.getDay();
	const monday = new Date(now);
	const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
	monday.setDate(now.getDate() + diff + offset * 7);

	return Array.from({ length: 7 }, (_, i) => {
		const date = new Date(monday);
		date.setDate(monday.getDate() + i);
		date.setHours(0, 0, 0, 0);
		return date;
	});
}
/**
 * En tu archivo $lib/utils/agenda.ts (o donde tengas tus utilidades de fecha)
 */
export function formatWeekRange(weekDates: Date[]): string {
	if (weekDates.length === 0) return '';
	
	const firstDate = weekDates[0];
	const lastDate = weekDates[weekDates.length - 1];
	
	const firstDay = firstDate.getDate();
	const lastDay = lastDate.getDate();
	
	const months = [
		'ene', 'feb', 'mar', 'abr', 'may', 'jun',
		'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
	];
	
	const firstMonth = months[firstDate.getMonth()];
	const lastMonth = months[lastDate.getMonth()];
	const year = lastDate.getFullYear();
	
	// Si es el mismo mes
	if (firstDate.getMonth() === lastDate.getMonth()) {
		return `${firstDay}-${lastDay} ${firstMonth} ${year}`;
	}
	
	// Si son meses diferentes
	return `${firstDay} ${firstMonth} - ${lastDay} ${lastMonth} ${year}`;
}
/**
 * Compara si dos fechas son del mismo día
 */
export function isSameDay(date1: Date, date2: Date): boolean {
	return date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate();
}

/**
 * Formatea una fecha como DD/MM
 */
export function formatDate(date: Date): string {
	return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Formatea una fecha completa como DD/MM/YYYY
 */
export function formatDateFull(date: Date): string {
	return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

/**
 * Formatea una fecha y hora para el backend (YYYY-MM-DD HH:MM)
 */
export function formatDateTime(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	const h = String(date.getHours()).padStart(2, '0');
	const min = String(date.getMinutes()).padStart(2, '0');
	return `${y}-${m}-${d} ${h}:${min}`;
}

/**
 * Formatea una fecha para input datetime-local (YYYY-MM-DDTHH:MM)
 */
export function formatDateTimeLocal(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	const h = String(date.getHours()).padStart(2, '0');
	const min = String(date.getMinutes()).padStart(2, '0');
	return `${y}-${m}-${d}T${h}:${min}`;
}

/**
 * Parsea un string de datetime-local a Date
 */
export function parseDateTimeLocal(dateTimeStr: string): Date {
	return new Date(dateTimeStr);
}

/**
 * Calcula cuántos slots ocupa un evento basado en su duración
 * @param inicio - Fecha/string de inicio
 * @param fin - Fecha/string de fin
 * @param slotMinutes - Minutos por slot (default: 15)
 */
export function calculateSlots(inicio: string | Date, fin: string | Date, slotMinutes: number = 15): number {
	const start = inicio instanceof Date ? inicio : new Date(inicio);
	const end = fin instanceof Date ? fin : new Date(fin);
	const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
	return Math.max(1, Math.round(durationMinutes / slotMinutes));
}

/**
 * Calcula la duración en minutos entre dos fechas
 */
export function calculateDuration(inicio: string | Date, fin: string | Date): number {
	const start = inicio instanceof Date ? inicio : new Date(inicio);
	const end = fin instanceof Date ? fin : new Date(fin);
	return (end.getTime() - start.getTime()) / (1000 * 60);
}

/**
 * Agrega minutos a una fecha
 */
export function addMinutes(date: Date, minutes: number): Date {
	return new Date(date.getTime() + minutes * 60 * 1000);
}

/**
 * Redondea una fecha al slot más cercano
 * @param date - Fecha a redondear
 * @param slotMinutes - Minutos por slot (default: 15)
 */
export function roundToNearestSlot(date: Date, slotMinutes: number = 15): Date {
	const ms = 1000 * 60 * slotMinutes;
	return new Date(Math.round(date.getTime() / ms) * ms);
}