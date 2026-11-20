<script lang="ts">
	type Partida = {
		descripcion: string;
		cantidad: number;
		precio_unitario: number;
	};

	type Props = {
		partidas?: Partida[];
		empresa?: string;
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
	};

	let {
		partidas = [],
		cliente = 'IMASA - OLEOFINOS',
		contacto = 'TEL: 33 1903 5769',
		direccion = 'LIMÓN 1139, DEL FRESNO, 44900 GUADALAJARA, JAL.',
		folio = 'CGG-0870-2026',
		lugar = 'Guadalajara, Jalisco',
		fecha = '25, septiembre 2026',
		atencion = 'ING. IGNACIO RICO',
		referencia = 'BOMBA DE ENGRANES',
		tiempoEntrega = '24 – 38',
		formaEmbarque = 'LAB',
		vigencia = '29-06-2026',
		condicionesPago = '30'
	}: Props = $props();

	const IVA = 0.16;
	const MIN_FILAS_PARTIDAS = 5;
	let loading = $state(false);

	const partidasNormalizadas = $derived(
		partidas.map((p) => {
			const pedido = p as Partida & {
				catalogo?: { descripcion?: string | null } | null;
				observaciones?: string | null;
			};
			return {
				descripcion: String(
					pedido.descripcion || pedido.catalogo?.descripcion || pedido.observaciones || ''
				),
				cantidad: Number(pedido.cantidad) || 0,
				precio_unitario: Number(pedido.precio_unitario) || 0
			};
		})
	);

	const filasVacias = $derived(Math.max(0, MIN_FILAS_PARTIDAS - partidasNormalizadas.length));

	let subtotal = $derived(
		partidasNormalizadas.reduce((total, p) => total + p.cantidad * p.precio_unitario, 0)
	);
	let iva = $derived(subtotal * IVA);
	let total = $derived(subtotal + iva);

	const moneda = (valor: number) =>
		new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(valor);

	async function descargarPDF() {
		if (loading) return;
		loading = true;
		try {
			const response = await fetch('/api/pdf', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					cliente,
					contacto,
					direccion,
					folio,
					lugar,
					fecha,
					atencion,
					referencia,
					tiempoEntrega,
					formaEmbarque,
					vigencia,
					condicionesPago,
					partidas: partidasNormalizadas,
					subtotal,
					iva,
					total
				})
			});

			if (!response.ok) {
				throw new Error('No se pudo generar el PDF');
			}

			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `Cotizacion-${folio}.pdf`;
			link.style.display = 'none';
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error(error);
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Cotización {folio}</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="cotizador">
	<div class="toolbar no-print">
		<div>
			<strong>Vista previa de cotización</strong>
			<span>Formato carta · PDF</span>
		</div>
		<button onclick={descargarPDF} disabled={loading}>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				width="18"
				height="18"
			>
				<path
					d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
				/>
				<path d="M7 14h10v7H7z" />
			</svg>
			{loading ? 'Generando…' : 'Guardar PDF'}
		</button>
	</div>

	<div class="documento-contenedor">
		<div class="marca-agua">
			<img src="/bms-logo.svg" alt="bms-marca-agua" />
		</div>

		<table class="tabla-maestra">
			<thead>
				<tr>
					<td>
						<header class="encabezado">
							<div class="encabezado-izq">
								<div class="logo">
									<img src="/BMS-LOGO-LOW.png" alt="LOGO BMS" />
								</div>
							</div>

							<div class="documento">
								<h2>Cotización</h2>
								<table class="meta-tabla">
									<tbody>
										<tr>
											<td class="etiqueta">Serie:</td>
											<td><strong>{folio}</strong></td>
										</tr>
										<tr>
											<td class="etiqueta">Lugar:</td>
											<td class="borde-inferior">{lugar}</td>
										</tr>
										<tr>
											<td class="etiqueta">Fecha:</td>
											<td>{fecha}</td>
										</tr>
									</tbody>
								</table>

								<div class="atencion-bloque">
									<span class="etiqueta">AT´N:</span>
									<strong>{atencion}</strong>
								</div>
							</div>
						</header>
					</td>
				</tr>
			</thead>

			<tbody>
				<tr>
					<td>
						<div class="contenido-principal">
							<section class="info-general">
								<div class="cliente-info">
									<p><span class="etiqueta">CLIENTE:</span> <strong>{cliente}</strong></p>
									<p><span class="etiqueta">CONTACTO:</span> {contacto}</p>
									<p><span class="etiqueta">DIRECCION:</span> {direccion}</p>
									<br />
									<p><span class="etiqueta">REF:</span> <strong>{referencia}</strong></p>
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
										{#each partidasNormalizadas as partida, i}
											<tr>
												<td class="col-no text-center">{i + 1}</td>
												<td class="col-cant text-center">{partida.cantidad}</td>
												<td class="col-desc text-center">{partida.descripcion}</td>
												<td class="col-precio text-center">{moneda(partida.precio_unitario)}</td>
												<td class="col-total text-center"
													>{moneda(partida.cantidad * partida.precio_unitario)}</td
												>
											</tr>
										{/each}
									</tbody>
								</table>

								<table class="tabla-totales">
									<tbody>
										<tr>
											<td class="etiqueta-total">SUBTOTAL</td>
											<td class="valor-total">{moneda(subtotal)}</td>
										</tr>
										<tr>
											<td class="etiqueta-total">MAS 16% I.V.A.</td>
											<td class="valor-total">{moneda(iva)}</td>
										</tr>
										<tr>
											<td class="etiqueta-gran-total">TOTAL</td>
											<td class="valor-gran-total"><strong>{moneda(total)}</strong></td>
										</tr>
									</tbody>
								</table>
							</div>

							<table class="tabla-condiciones">
								<tbody>
									<tr>
										<td class="etiqueta-cond">Tiempo de entrega:</td>
										<td class="valor-cond"><strong>{tiempoEntrega}</strong></td>
										<td class="extra-cond"
											>SEMANAS DE TIEMPO DE ENTREGA A PARTIR DE LA CONFIRMACION DE PEDIDO</td
										>
									</tr>
									<tr>
										<td class="etiqueta-cond">Forma de embarque:</td>
										<td class="valor-cond" colspan="2"><strong>{formaEmbarque}</strong></td>
									</tr>
									<tr>
										<td class="etiqueta-cond">Vigencia:</td>
										<td class="valor-cond" colspan="2"><strong>{vigencia}</strong></td>
									</tr>
									<tr>
										<td class="etiqueta-cond">Condiciones de pago:</td>
										<td class="valor-cond"><strong>{condicionesPago}</strong></td>
										<td class="extra-cond">DIAS DE CREDITO</td>
									</tr>
								</tbody>
							</table>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</div>

<style>
	* {
		box-sizing: border-box;
	}

	.cotizador {
		width: 100%;
		font-family: Arial, sans-serif;
		color: #000;
	}

	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		width: 100%;
		max-width: 900px;
		margin: 0 auto 18px;
		font-family: system-ui, sans-serif;
	}
	.toolbar > div {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.toolbar button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 16px;
		border: 0;
		border-radius: 7px;
		background: #173b63;
		color: white;
		font-weight: 600;
		cursor: pointer;
	}
	.toolbar button:disabled {
		opacity: 0.65;
		cursor: wait;
	}

	.documento-contenedor {
		position: relative;
		width: 100%;
		max-width: 216mm;
		margin: 0 auto;
		background: #fff;
		box-shadow: 0 4px 25px #172b451c;
		padding: 15px;
		font-size: 11px;
	}

	.marca-agua {
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		opacity: 0.1;
		z-index: 0;
		pointer-events: none;
	}
	.marca-agua img {
		max-width: 100%;
	}

	.tabla-maestra {
		width: 100%;
		border-collapse: collapse;
		border: none !important;
		position: relative;
		z-index: 1;
	}
	.tabla-maestra > thead > tr > td,
	.tabla-maestra > tbody > tr > td {
		border: none !important;
		padding: 0;
		background: transparent;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	td,
	th {
		border: 1px solid #000;
		padding: 3px 5px;
	}

	.encabezado {
		display: grid;
		grid-template-columns: 3fr 2fr;
		gap: 20px;
	}
	.encabezado-izq {
		display: flex;
		align-items: baseline;
		padding-top: 1px; /* ajuste por la imagen */
		gap: 10px;
	}
	.logo img {
		width: 80%;
	}
	.documento {
        width: 100%;
	}
	.documento h2 {
		font-size: 22px;
		font-weight: normal;
		margin: 0 0 10px 0;
	}
	.meta-tabla td {
		padding: 2px 0;
		vertical-align: bottom;
		border: none;
	}
	.meta-tabla .etiqueta {
		width: 50px;
	}

	.atencion-bloque {
		margin-top: var(--y);
		border-top: 1px solid #000;
		padding-top: var(--y);
		display: flex;
		gap: 10px;
	}

	.info-general {
		margin-bottom: 15px;
	}
	.cliente-info p {
		margin: 2px 0;
		display: flex;
	}
	.cliente-info .etiqueta {
		width: 80px;
		display: inline-block;
	}

	.partidas {
		margin: 15px 0;
	}
	th {
		border: none;
	}
	.tabla-partidas th {
		background-color: transparent;
		font-weight: bold;
		text-transform: uppercase;
	}
	.tabla-partidas .col-no {
		width: 5%;
	}
	.tabla-partidas .col-cant {
		width: 8%;
	}
	.tabla-partidas .col-desc {
		width: 55%;
	}
	.tabla-partidas .col-precio {
		width: 16%;
	}
	.tabla-partidas .col-total {
		width: 16%;
	}
	.text-center {
		text-align: center;
	}

	.tabla-totales {
		margin-left: auto;
		width: 32%;
		border: 1px solid #000;
		margin-top: var(--b);
	}
	.tabla-totales td {
		border: 1px solid #000;
	}
	.etiqueta-total,
	.etiqueta-gran-total {
		text-align: right;
	}
	.etiqueta-gran-total {
		font-size: 16px;
		font-weight: bold;
	}
	.valor-total,
	.valor-gran-total {
		text-align: center;
	}

	.tabla-condiciones {
		margin-top: 15px;
	}
	.tabla-condiciones .etiqueta-cond {
		border: none;
		width: 15%;
	}
	.tabla-condiciones .valor-cond {
		width: 25%;
	}
	.tabla-condiciones .extra-cond {
		width: 60%;
	}

	/* IMPRESIÓN */
	@page {
		size: letter portrait;
		margin: 10mm;
	}

	@media print {
		/* 1. Limpiamos el fondo y aseguramos que el body permita desbordamiento (páginas) */
		:global(html),
		:global(body) {
			background: white !important;
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
			margin: 0 !important;
			padding: 0 !important;
			overflow: visible !important;
		}

		/* 2. Ocultamos herramientas internas */
		.no-print {
			display: none !important;
		}

		/* 3. Contenedor libre para crecer */
		.documento-contenedor {
			width: 100%;
			max-width: none;
			min-height: 0;
			margin: 0;
			box-shadow: none;
			padding: 0;
			position: static;
		}

		thead {
			display: table-header-group;
		}

		.tabla-partidas tr,
		.tabla-totales,
		.tabla-condiciones {
			page-break-inside: avoid;
			break-inside: avoid;
		}
	}
</style>
