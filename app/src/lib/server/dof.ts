const SIDOF_INDICADORES = 'https://sidof.segob.gob.mx/dof/sidof/indicadores';
const DOF_INDICADORES_XML = [
	'https://dof.gob.mx/indicadores.xml',
	'https://www.dof.gob.mx/indicadores.xml'
];
const COD_DOLAR = 158;
const CACHE_MS = 6 * 60 * 60 * 1000;

export type DofRates = {
	valor: number | null;
	fecha: string | null;
	tasas: Record<string, number>;
};

type CacheEntry = {
	key: string;
	data: DofRates;
	expires: number;
};

let cache: CacheEntry | null = null;

function pad(value: number): string {
	return String(value).padStart(2, '0');
}

function toIsoDate(date: Date): string {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toDofDate(date: Date): string {
	return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

function parseIsoDate(value: string): Date | null {
	const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!match) return null;

	const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
	return isNaN(date.getTime()) ? null : date;
}

function expandYear(year: number): number {
	if (year >= 100) return year;
	return year >= 70 ? 1900 + year : 2000 + year;
}

function parseDofDate(value: string): string | null {
	const slash = value.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/);
	if (slash) {
		return `${expandYear(Number(slash[3]))}-${pad(Number(slash[2]))}-${pad(Number(slash[1]))}`;
	}

	const iso = parseIsoDate(value.trim());
	return iso ? toIsoDate(iso) : null;
}

function parseValor(value: unknown): number | null {
	if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;

	const parsed = Number(
		String(value ?? '')
			.trim()
			.replace('%', '')
			.replace(',', '.')
	);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function emptyRates(): DofRates {
	return { valor: null, fecha: null, tasas: {} };
}

function withLatest(tasas: Record<string, number>): DofRates {
	const fechas = Object.keys(tasas).sort();
	const fecha = fechas.at(-1) ?? null;

	return {
		valor: fecha ? tasas[fecha] : null,
		fecha,
		tasas
	};
}

function mergeRates(...grupos: Record<string, number>[]): Record<string, number> {
	return Object.assign({}, ...grupos);
}

function headers(): HeadersInit {
	return {
		Accept: 'application/json, application/xml, text/xml, application/rss+xml, */*',
		'User-Agent': 'Mozilla/5.0 PODCO'
	};
}

function isDolarCodigo(codigo: unknown): boolean {
	return Number(codigo) === COD_DOLAR;
}

function collectRates(payload: unknown): Record<string, number> {
	const tasas: Record<string, number> = {};
	const lista = Array.isArray(payload)
		? payload
		: payload && typeof payload === 'object'
			? ((payload as Record<string, unknown>).ListaIndicadores ??
				(payload as Record<string, unknown>).listaIndicadores ??
				(payload as Record<string, unknown>).indicadores ??
				[])
			: [];

	if (!Array.isArray(lista)) return tasas;

	for (const item of lista) {
		if (!item || typeof item !== 'object') continue;

		const indicador = item as Record<string, unknown>;
		if (!isDolarCodigo(indicador.codTipoIndicador ?? indicador.codIndicador)) continue;

		const fecha = parseDofDate(String(indicador.fecha ?? indicador.Fecha ?? ''));
		const valor = parseValor(indicador.valor ?? indicador.Valor);

		if (fecha && valor) tasas[fecha] = valor;
	}

	return tasas;
}

function tagValue(block: string, name: string): string {
	return block.match(new RegExp(`<${name}>\\s*([^<]+)\\s*</${name}>`, 'i'))?.[1]?.trim() ?? '';
}

function collectRatesFromXml(xml: string): Record<string, number> {
	const tasas: Record<string, number> = {};

	for (const item of xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? []) {
		const title = tagValue(item, 'title').toUpperCase().normalize('NFD').replace(/\p{M}/gu, '');
		if (title !== 'DOLAR') continue;

		const fecha =
			parseDofDate(tagValue(item, 'valueDate')) ?? parseDofDate(tagValue(item, 'pubDate'));
		const valor = parseValor(tagValue(item, 'description') || tagValue(item, 'valor'));

		if (fecha && valor) tasas[fecha] = valor;
	}

	if (Object.keys(tasas).length) return tasas;

	for (const bloque of xml.match(/<indicador\b[\s\S]*?<\/indicador>/gi) ?? []) {
		const codigo =
			bloque.match(/codTipoIndicador=["'](\d+)["']/i)?.[1] ?? tagValue(bloque, 'codTipoIndicador');

		if (codigo && !isDolarCodigo(codigo)) continue;

		const fecha = parseDofDate(
			bloque.match(/fecha=["']([^"']+)["']/i)?.[1] ?? tagValue(bloque, 'fecha')
		);
		const valor = parseValor(tagValue(bloque, 'valor'));

		if (fecha && valor) tasas[fecha] = valor;
	}

	return tasas;
}

async function readBody(response: Response): Promise<string> {
	if (!response.ok) {
		throw new Error(`DOF ${response.status}`);
	}

	return response.text();
}

async function fetchSidof(from: Date, to: Date): Promise<Record<string, number>> {
	const inicio = toDofDate(from);
	const fin = toDofDate(to);
	const urls = [
		`${SIDOF_INDICADORES}/${inicio}/${fin}`,
		`${SIDOF_INDICADORES}/${COD_DOLAR}/${inicio}/${fin}`,
		`${SIDOF_INDICADORES}/${inicio}/${fin}/${COD_DOLAR}`
	];

	let tasas: Record<string, number> = {};

	for (const url of urls) {
		try {
			const body = await readBody(await fetch(url, { headers: headers() }));
			const parsed =
				body.trim().startsWith('{') || body.trim().startsWith('[')
					? collectRates(JSON.parse(body))
					: collectRatesFromXml(body);

			tasas = mergeRates(tasas, parsed);
			if (Object.keys(tasas).length) return tasas;
		} catch {
			continue;
		}
	}

	return tasas;
}

async function fetchDofXml(): Promise<Record<string, number>> {
	for (const url of DOF_INDICADORES_XML) {
		try {
			const tasas = collectRatesFromXml(await readBody(await fetch(url, { headers: headers() })));
			if (Object.keys(tasas).length) return tasas;
		} catch {
			continue;
		}
	}

	return {};
}

export async function getDofUsdRates(desde?: string, hasta?: string): Promise<DofRates> {
	const to = parseIsoDate(hasta ?? '') ?? new Date();
	const from =
		parseIsoDate(desde ?? '') ?? new Date(to.getFullYear(), to.getMonth() - 1, to.getDate());

	if (from > to) {
		return emptyRates();
	}

	const key = `${toIsoDate(from)}:${toIsoDate(to)}`;

	if (cache && cache.key === key && cache.expires > Date.now()) {
		return cache.data;
	}

	const sidof = await fetchSidof(from, to).catch(() => ({}));
	const rss = Object.keys(sidof).length ? {} : await fetchDofXml().catch(() => ({}));
	const data = withLatest(mergeRates(sidof, rss));

	if (data.valor) {
		cache = { key, data, expires: Date.now() + CACHE_MS };
	}

	return data;
}
