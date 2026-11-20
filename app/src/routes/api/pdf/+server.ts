import { json, type RequestHandler } from '@sveltejs/kit';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

type PartidaPdf = {
	descripcion: string;
	cantidad: number;
	precio_unitario: number;
};

type CotizacionPdfPayload = {
	cliente?: string;
	contacto?: string;
	direccion?: string;
	folio?: string;
	lugar?: string;
	fecha?: string;
	atencion?: string;
	referencia?: string;
	tiempoEntrega?: string;
	formaEmbarque?: string;
	vigencia?: string;
	condicionesPago?: string;
	partidas?: unknown[];
	subtotal?: number;
	iva?: number;
	total?: number;
};

const IVA = 0.16;

function escapeHtml(value: unknown): string {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function numero(value: unknown): number {
	const n = Number(value);
	return Number.isFinite(n) ? n : 0;
}

function moneda(valor: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD'
	}).format(valor);
}

function normalizarPartidas(raw: unknown[]): PartidaPdf[] {
	if (!Array.isArray(raw)) return [];

	return raw.map((item) => {
		const partida = (item ?? {}) as Record<string, unknown>;
		const catalogo = (partida.catalogo ?? {}) as Record<string, unknown>;
		return {
			descripcion: String(
				partida.descripcion || catalogo.descripcion || partida.observaciones || ''
			),
			cantidad: numero(partida.cantidad),
			precio_unitario: numero(partida.precio_unitario)
		};
	});
}

function resolveStatic(file: string): string | null {
	const candidates = [
		path.join(process.cwd(), 'static', file),
		path.join(process.cwd(), 'app', 'static', file)
	];
	return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

async function toDataUrl(file: string, mime: string): Promise<string | null> {
	const filePath = resolveStatic(file);
	if (!filePath) return null;
	const buffer = await readFile(filePath);
	return `data:${mime};base64,${buffer.toString('base64')}`;
}

function buildHeaderTemplate(
	data: {
		folio: string;
		lugar: string;
		fecha: string;
		atencion: string;
	},
	logo: string | null
): string {
	const logoHtml = logo
		? `<img src="${logo}" alt="LOGO BMS" />`
		: `<div style="font-size:18px;font-weight:bold;">BMS</div>`;

	return `
		<style>
			* { margin: 0; padding: 0; box-sizing: border-box; }
			html, body { width: 100%; }
			.encabezado {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				width: 100%;
				padding: 16px 32px 0 32px;
				font-family: Arial, sans-serif;
				color: #000;
				-webkit-print-color-adjust: exact;
				print-color-adjust: exact;
			}
			.encabezado table { width: 100%; border-collapse: collapse; }
			.encabezado td { border: none; }
			.logo {
				width: 60%;
				vertical-align: baseline;
				padding-top: 1px;
			}
			.logo img {
				width: 80%;
				max-height: none;
				object-fit: contain;
				object-position: left center;
			}
			.documento {
				width: 40%;
				text-align: center;
				vertical-align: top;
			}
			.documento-inner { display: inline-block; text-align: left; }
			.documento h2 {
				font-size: 22px;
				font-weight: normal;
				margin: 0 0 10px 0;
			}
			.meta { width: auto; }
			.meta td {
				font-size: 11px;
				padding: 2px 0;
				border: none;
				vertical-align: bottom;
			}
			.etiqueta { width: 50px; }
			.atn {
				margin-top: 4px;
				padding-top: 4px;
				border-top: 1px solid #000;
				font-size: 11px;
				display: flex;
				gap: 10px;
			}
		</style>
		<div class="encabezado">
			<table>
				<tr>
					<td class="logo">${logoHtml}</td>
					<td class="documento">
						<div class="documento-inner">
							<h2>Cotización</h2>
							<table class="meta">
								<tr>
									<td class="etiqueta">Serie:</td>
									<td><strong>${escapeHtml(data.folio)}</strong></td>
								</tr>
								<tr>
									<td class="etiqueta">Lugar:</td>
									<td>${escapeHtml(data.lugar)}</td>
								</tr>
								<tr>
									<td class="etiqueta">Fecha:</td>
									<td>${escapeHtml(data.fecha)}</td>
								</tr>
							</table>
							<div class="atn">
								<span>AT´N:</span>
								<strong>${escapeHtml(data.atencion)}</strong>
							</div>
						</div>
					</td>
				</tr>
			</table>
		</div>
	`;
}

function buildFooterTemplate(sellos: string | null): string {
	const sellosHtml = sellos
		? `<img src="${sellos}" alt="Sellos BMS" />`
		: '';

	return `
		<style>
			* { margin: 0; padding: 0; box-sizing: border-box; }
			html, body { width: 100%; }
			.pie {
				position: absolute;
				bottom: 0;
				left: 0;
				right: 0;
				width: 100%;
				padding: 0 32px 16px 32px;
				font-family: Arial, sans-serif;
				color: #000;
				-webkit-print-color-adjust: exact;
				print-color-adjust: exact;
			}
			.pie table { width: 100%; border-collapse: collapse; }
			.pie td { border: none; vertical-align: bottom; }
			.contacto { font-size: 9px; line-height: 1.35; }
			.contacto a { color: #0000ee; }
			.terminos {
				font-size: 8px;
				line-height: 1.25;
				padding-bottom: 6px;
			}
			.terminos p { margin: 0 0 3px 0; }
			.pagina {
				text-align: right;
				font-size: 10px;
				white-space: nowrap;
			}
			.pageNumber, .totalPages { font-size: 10px; }
			.sellos { text-align: right; padding-top: 4px; width: 42%; }
			.sellos img {
				display: block;
				margin-left: auto;
				height: 58px;
				width: auto;
			}
		</style>
		<div class="pie">
			<div class="terminos">
				<p><strong>Los precios son en dólares americanos pagaderos al tipo de cambio interbancario a la venta vigente al día de la acreditación del pago</strong></p>
				<p><strong>Garantía:</strong> El plazo de garantía es de 12 meses desde la puesta en marcha o un máximo de 18 meses desde la entrega.</p>
				<p><strong>Materiales:</strong> BMS COMPONENTES Y EQUIPOS INDUSTRIALES S.A de C.V garantiza que los materiales de fabricación son los detallados en las especificaciones.</p>
				<p><strong>Cancelación:</strong> En caso de cancelación se hará un cargo equivalente al 70% del monto de su orden de compra.</p>
			</div>
			<table>
				<tr>
					<td class="contacto">
						<div>Teléfonos fijos: 33 36014814 / 33 36014121</div>
						<div>Página web: <a href="https://www.bmscomponentes.com">https://www.bmscomponentes.com</a></div>
						<div>Antonio Bravo No. 128, Col. Las Liebres, Tlaquepaque, Jalisco, C.P. 45623</div>
					</td>
					<td class="pagina">
						Página <span class="pageNumber"></span> de <span class="totalPages"></span>
					</td>
				</tr>
				<tr>
					<td></td>
					<td class="sellos">${sellosHtml}</td>
				</tr>
			</table>
		</div>
	`;
}

function buildHtmlContent(data: {
	cliente: string;
	contacto: string;
	direccion: string;
	referencia: string;
	tiempoEntrega: string;
	formaEmbarque: string;
	vigencia: string;
	condicionesPago: string;
	partidas: PartidaPdf[];
	subtotal: number;
	iva: number;
	total: number;
	watermark: string | null;
}): string {
	const filas =
		data.partidas.length > 0
			? data.partidas
					.map(
						(partida, i) => `
				<tr>
					<td class="col-no">${i + 1}</td>
					<td class="col-cant">${escapeHtml(partida.cantidad)}</td>
					<td class="col-desc">${escapeHtml(partida.descripcion)}</td>
					<td class="col-precio">${escapeHtml(moneda(partida.precio_unitario))}</td>
					<td class="col-total">${escapeHtml(moneda(partida.cantidad * partida.precio_unitario))}</td>
				</tr>`
					)
					.join('')
			: '';

	const watermarkHtml = data.watermark
		? `<div class="marca-agua"><img src="${data.watermark}" alt="bms-marca-agua" /></div>`
		: '';

	return `<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="utf-8" />
	<title>Cotización</title>
	<style>
		* { box-sizing: border-box; }
		html, body {
			margin: 0;
			padding: 0;
			background: #fff;
			color: #000;
			font-family: Arial, sans-serif;
			font-size: 11px;
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}
		.marca-agua {
			position: fixed;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			opacity: 0.1;
			z-index: 0;
			pointer-events: none;
			width: 80%;
		}
		.marca-agua img {
			display: block;
			width: 100%;
			height: auto;
		}
		.contenido {
			position: relative;
			z-index: 1;
		}
		table {
			width: 100%;
			border-collapse: collapse;
		}
		th, td {
			border: 1px solid #000;
			padding: 3px 5px;
		}
		th { border: none; }
		.info-general { margin-bottom: 15px; }
		.cliente-info p {
			margin: 2px 0;
			display: flex;
		}
		.cliente-info .etiqueta {
			width: 80px;
			display: inline-block;
		}
		.partidas { margin: 15px 0; }
		.tabla-partidas th {
			background-color: transparent;
			font-weight: bold;
			text-transform: uppercase;
			text-align: center;
		}
		.tabla-partidas td { text-align: center; }
		.col-no { width: 5%; }
		.col-cant { width: 8%; }
		.col-desc { width: 55%; }
		.col-precio, .col-total { width: 16%; }
		.tabla-totales {
			margin-left: auto;
			width: 32%;
			border: 1px solid #000;
			margin-top: 12px;
		}
		.tabla-totales td { border: 1px solid #000; }
		.etiqueta-total, .etiqueta-gran-total { text-align: right; }
		.etiqueta-gran-total { font-size: 16px; font-weight: bold; }
		.valor-total, .valor-gran-total { text-align: center; }
		.tabla-condiciones { margin-top: 15px; }
		.etiqueta-cond { width: 15%; border: none; }
		.valor-cond { width: 25%; }
		.extra-cond { width: 60%; }
	</style>
</head>
<body>
	${watermarkHtml}
	<div class="contenido">
		<section class="info-general">
			<div class="cliente-info">
				<p><span class="etiqueta">CLIENTE:</span> <strong>${escapeHtml(data.cliente)}</strong></p>
				<p><span class="etiqueta">CONTACTO:</span> ${escapeHtml(data.contacto)}</p>
				<p><span class="etiqueta">DIRECCION:</span> ${escapeHtml(data.direccion)}</p>
				<br />
				<p><span class="etiqueta">REF:</span> <strong>${escapeHtml(data.referencia)}</strong></p>
			</div>
		</section>

		<table>
			<thead>
				<tr>
					<th>Requisito</th>
					<th>Observaciones</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><p>informacion tecnica, datos de operacion o solicitud especifica</p></td>
					<td><p>notas generales que aplican a todo el documento</p></td>
				</tr>
			</tbody>
		</table>

		<div class="partidas">
			<table class="tabla-partidas">
				<thead>
					<tr>
						<th class="col-no">no.</th>
						<th class="col-cant">cant.</th>
						<th class="col-desc">DESCRIPCION</th>
						<th class="col-precio">UNITARIO</th>
						<th class="col-total">TOTAL</th>
					</tr>
				</thead>
				<tbody>
					${filas}
				</tbody>
			</table>
			<table class="tabla-totales">
				<tbody>
					<tr>
						<td class="etiqueta-total">SUBTOTAL</td>
						<td class="valor-total">${escapeHtml(moneda(data.subtotal))}</td>
					</tr>
					<tr>
						<td class="etiqueta-total">MAS 16% I.V.A.</td>
						<td class="valor-total">${escapeHtml(moneda(data.iva))}</td>
					</tr>
					<tr>
						<td class="etiqueta-gran-total">TOTAL</td>
						<td class="valor-gran-total"><strong>${escapeHtml(moneda(data.total))}</strong></td>
					</tr>
				</tbody>
			</table>
		</div>

		<table class="tabla-condiciones">
			<tbody>
				<tr>
					<td class="etiqueta-cond">Tiempo de entrega:</td>
					<td class="valor-cond"><strong>${escapeHtml(data.tiempoEntrega)}</strong></td>
					<td class="extra-cond">SEMANAS DE TIEMPO DE ENTREGA A PARTIR DE LA CONFIRMACION DE PEDIDO</td>
				</tr>
				<tr>
					<td class="etiqueta-cond">Forma de embarque:</td>
					<td class="valor-cond" colspan="2"><strong>${escapeHtml(data.formaEmbarque)}</strong></td>
				</tr>
				<tr>
					<td class="etiqueta-cond">Vigencia:</td>
					<td class="valor-cond" colspan="2"><strong>${escapeHtml(data.vigencia)}</strong></td>
				</tr>
				<tr>
					<td class="etiqueta-cond">Condiciones de pago:</td>
					<td class="valor-cond"><strong>${escapeHtml(data.condicionesPago)}</strong></td>
					<td class="extra-cond">DIAS DE CREDITO</td>
				</tr>
			</tbody>
		</table>
	</div>
</body>
</html>`;
}

export const POST: RequestHandler = async ({ request }) => {
	let payload: CotizacionPdfPayload;
	try {
		payload = await request.json();
	} catch {
		return json({ error: 'JSON inválido' }, { status: 400 });
	}

	const partidas = normalizarPartidas(payload.partidas ?? []);
	const subtotal = partidas.reduce((acc, p) => acc + p.cantidad * p.precio_unitario, 0);
	const iva = subtotal * IVA;
	const total = subtotal + iva;

	const folio = payload.folio || 'SIN-FOLIO';
	const safeFolio = String(folio).replace(/[^\w.-]+/g, '_');

	const [logo, watermark, sellos] = await Promise.all([
		toDataUrl('BMS-LOGO-LOW.png', 'image/png'),
		toDataUrl('BMS-WATERMARK.png', 'image/png'),
		toDataUrl('Sellos.png', 'image/png')
	]);

	const htmlContent = buildHtmlContent({
		cliente: payload.cliente || '',
		contacto: payload.contacto || '',
		direccion: payload.direccion || '',
		referencia: payload.referencia || '',
		tiempoEntrega: payload.tiempoEntrega || '',
		formaEmbarque: payload.formaEmbarque || '',
		vigencia: payload.vigencia || '',
		condicionesPago: payload.condicionesPago || '',
		partidas,
		subtotal,
		iva,
		total,
		watermark
	});

	const headerTemplate = buildHeaderTemplate(
		{
			folio,
			lugar: payload.lugar || '',
			fecha: payload.fecha || '',
			atencion: payload.atencion || ''
		},
		logo
	);

	const footerTemplate = buildFooterTemplate(sellos);

	let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;
	try {
		browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		});
		const page = await browser.newPage();
		await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
		const pdf = await page.pdf({
			format: 'Letter',
			printBackground: true,
			displayHeaderFooter: true,
			headerTemplate,
			footerTemplate,
			margin: {
				top: '130px',
				bottom: '180px',
				left: '15mm',
				right: '15mm'
			}
		});

		return new Response(Buffer.from(pdf), {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="Cotizacion-${safeFolio}.pdf"`
			}
		});
	} catch (error) {
		console.error('Error generando PDF', error);
		return json({ error: 'No se pudo generar el PDF' }, { status: 500 });
	} finally {
		await browser?.close();
	}
};
