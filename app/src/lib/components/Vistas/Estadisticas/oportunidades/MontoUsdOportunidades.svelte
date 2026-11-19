<script lang="ts">
	import * as echarts from 'echarts';
	import { profile } from '$lib/stores/profileStore.svelte';

	interface Pedido {
		cantidad?: number | null;
		precio_unitario?: number | null;
		moneda?: string | null;
		fecha_creacion?: string | Date | null;
		id_producto?: number | string | null;
		catalogo?: {
			id?: number | string;
			codigo?: string | null;
			descripcion?: string | null;
			tipo_producto?: { nombre?: string | null };
		};
	}

	interface Oportunidad {
		fecha_creacion?: string | Date | null;
		id_agente?: string | null;
		agentes?: {
			id?: string;
			nombre?: string;
		};
		pedidos?: Pedido[];
	}

	interface DofRates {
		valor: number | null;
		fecha: string | null;
		tasas: Record<string, number>;
	}

	interface Serie {
		id: string;
		name: string;
		data: number[];
	}

	interface Props {
		oportunidades?: Oportunidad[];
	}

	type Vista = 'total' | 'agente' | 'producto';

	let { oportunidades = [] }: Props = $props();
	console.log(oportunidades)
	let chartContainer = $state<HTMLDivElement>();
	let chart = $state<echarts.ECharts>();
	let tasas = $state<Record<string, number>>({});
	let tipoCambio = $state<number | null>(null);
	let fechaTipoCambio = $state<string | null>(null);
	let errorTipoCambio = $state<string | null>(null);
	let cargando = $state(false);
	let vista = $state<Vista>('total');

	const PALETTE = ['#0ea5e9', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#14b8a6', '#ec4899', '#6366f1'];
	const currency = new Intl.NumberFormat('es-MX', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	});

	function parseDate(value: string | Date | null | undefined): Date | null {
		if (!value) return null;

		const fecha = value instanceof Date ? value : new Date(value);
		return isNaN(fecha.getTime()) ? null : fecha;
	}

	function toIsoDate(fecha: Date): string {
		return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(
			fecha.getDate()
		).padStart(2, '0')}`;
	}

	function monthKey(fecha: Date): string {
		return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
	}

	function labelMes(clave: string): string {
		const [anio, numeroMes] = clave.split('-');

		return new Date(Number(anio), Number(numeroMes) - 1, 1).toLocaleDateString('es-MX', {
			month: 'short',
			year: 'numeric'
		});
	}

	function fillMonths(from: string, to: string): string[] {
		const months: string[] = [];
		const [fromYear, fromMonth] = from.split('-').map(Number);
		const [toYear, toMonth] = to.split('-').map(Number);
		const cursor = new Date(fromYear, fromMonth - 1, 1);
		const end = new Date(toYear, toMonth - 1, 1);

		while (cursor <= end) {
			months.push(monthKey(cursor));
			cursor.setMonth(cursor.getMonth() + 1);
		}

		return months;
	}

	function rateOn(fecha: Date): number | null {
		const cursor = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());

		for (let i = 0; i < 14; i++) {
			const valor = tasas[toIsoDate(cursor)];
			if (valor) return valor;
			cursor.setDate(cursor.getDate() - 1);
		}

		return tipoCambio;
	}

	function toUsd(pedido: Pedido, fecha: Date): number {
		const bruto = (Number(pedido.cantidad) || 0) * (Number(pedido.precio_unitario) || 0);
		if (bruto <= 0) return 0;

		const moneda = (pedido.moneda || 'USD').toUpperCase();

		if (moneda === 'USD') return bruto;
		if (moneda !== 'MXN') return 0;

		const tasa = rateOn(parseDate(pedido.fecha_creacion) ?? fecha);
		return tasa && tasa > 0 ? bruto / tasa : 0;
	}

	function agentOf(op: Oportunidad) {
		const id = op.id_agente || op.agentes?.id || 'sin-agente';
		const name = op.agentes?.nombre?.trim() || id;

		return { id, name };
	}

	function productOf(pedido: Pedido) {
		const id = String(pedido.catalogo?.codigo || pedido.id_producto || pedido.catalogo?.id || 'sin-producto');
		const name =
			pedido.catalogo?.codigo ||
			pedido.catalogo?.descripcion ||
			pedido.catalogo?.tipo_producto?.nombre ||
			id;

		return { id, name };
	}

	function monthsFrom(keys: string[]): string[] {
		const sorted = [...keys].sort();
		return sorted.length ? fillMonths(sorted[0], sorted[sorted.length - 1]) : [];
	}

	function seriesFrom(cells: Map<string, Map<string, number>>, names: Map<string, string>, months: string[]): Serie[] {
		return Array.from(names.entries())
			.map(([id, name]) => ({
				id,
				name,
				data: months.map((mes) => cells.get(id)?.get(mes) || 0),
				total: months.reduce((suma, mes) => suma + (cells.get(id)?.get(mes) || 0), 0)
			}))
			.sort((a, b) => b.total - a.total)
			.map(({ id, name, data }) => ({ id, name, data }));
	}

	let esAdmin = $derived($profile?.isAdmin === true);

	$effect(() => {
		if (!esAdmin && vista !== 'total') vista = 'total';
	});

	let oportunidadesValidas = $derived(
		oportunidades.filter((op) => op.agentes?.nombre?.toLowerCase() !== 'pruebas')
	);

	$effect(() => {
		const fechas = oportunidadesValidas
			.flatMap((op) => [
				parseDate(op.fecha_creacion),
				...(op.pedidos ?? []).map((pedido) => parseDate(pedido.fecha_creacion))
			])
			.filter((fecha): fecha is Date => fecha !== null)
			.sort((a, b) => a.getTime() - b.getTime());

		const hasta = toIsoDate(new Date());
		const desde = toIsoDate(
			fechas[0]
				? new Date(fechas[0].getFullYear(), fechas[0].getMonth(), fechas[0].getDate())
				: new Date()
		);

		const controller = new AbortController();
		cargando = true;
		errorTipoCambio = null;

		fetch(`/api/dof/tipo-cambio?desde=${desde}&hasta=${hasta}`, { signal: controller.signal })
			.then(async (response) => {
				if (!response.ok) throw new Error('DOF no disponible');

				const data = (await response.json()) as DofRates;
				tasas = data.tasas ?? {};
				tipoCambio = data.valor;
				fechaTipoCambio = data.fecha;
			})
			.catch((error) => {
				if (controller.signal.aborted) return;
				errorTipoCambio = error instanceof Error ? error.message : 'DOF no disponible';
			})
			.finally(() => {
				if (!controller.signal.aborted) cargando = false;
			});

		return () => controller.abort();
	});

	let chartData = $derived.by(() => {
		const totals = new Map<string, number>();
		const byAgent = new Map<string, Map<string, number>>();
		const byProduct = new Map<string, Map<string, number>>();
		const agentNames = new Map<string, string>();
		const productNames = new Map<string, string>();
		const productTotals = new Map<string, number>();

		oportunidadesValidas.forEach((op) => {
			if (!op.pedidos?.length) return;

			const fecha = parseDate(op.fecha_creacion);
			if (!fecha) return;

			const mes = monthKey(fecha);
			const agente = agentOf(op);
			agentNames.set(agente.id, agente.name);

			op.pedidos.forEach((pedido) => {
				const usd = toUsd(pedido, fecha);
				if (usd <= 0) return;

				totals.set(mes, (totals.get(mes) || 0) + usd);

				const agentMonth = byAgent.get(agente.id) ?? new Map<string, number>();
				agentMonth.set(mes, (agentMonth.get(mes) || 0) + usd);
				byAgent.set(agente.id, agentMonth);

				const producto = productOf(pedido);
				productNames.set(producto.id, producto.name);
				productTotals.set(producto.id, (productTotals.get(producto.id) || 0) + usd);

				const productMonth = byProduct.get(producto.id) ?? new Map<string, number>();
				productMonth.set(mes, (productMonth.get(mes) || 0) + usd);
				byProduct.set(producto.id, productMonth);
			});
		});

		const meses = monthsFrom(Array.from(totals.keys()));
		const categorias = meses.map(labelMes);
		const valores = meses.map((mes) => totals.get(mes) || 0);

		if (vista === 'agente') {
			return {
				categorias,
				valores,
				series: seriesFrom(byAgent, agentNames, meses)
			};
		}

		if (vista === 'producto') {
			const topIds = Array.from(productTotals.entries())
				.sort((a, b) => b[1] - a[1])
				.slice(0, 5)
				.map(([id]) => id);
			const names = new Map(topIds.map((id) => [id, productNames.get(id) || id]));
			const cells = new Map(topIds.map((id) => [id, byProduct.get(id) ?? new Map<string, number>()]));

			return {
				categorias,
				valores,
				series: seriesFrom(cells, names, meses)
			};
		}

		return {
			categorias,
			valores,
			series: [{ id: 'total', name: 'USD', data: valores }] satisfies Serie[]
		};
	});

	let total = $derived(chartData.valores.reduce((suma, valor) => suma + valor, 0));

	$effect(() => {
		if (!chartContainer) return;

		chart = echarts.init(chartContainer);

		const handleResize = () => chart?.resize();
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			chart?.dispose();
		};
	});

	$effect(() => {
		if (!chart) return;

		const grouped = vista !== 'total';
		const option: echarts.EChartsCoreOption = {
			title: {
				text: 'Monto en USD',
				subtext:
					vista === 'agente'
						? 'Total por mes por agente'
						: vista === 'producto'
							? 'Top 5 productos por mes'
							: fechaTipoCambio && tipoCambio
								? `MXN convertido con FIX DOF ${tipoCambio.toFixed(4)} (${fechaTipoCambio})`
								: 'cantidad × precio unitario por mes',
				left: 'center'
			},
			legend: grouped
				? {
						top: 52,
						type: 'scroll'
					}
				: { show: false },
			tooltip: {
				trigger: 'axis',
				axisPointer: { type: 'shadow' },
				formatter: (params: unknown) => {
					const items = Array.isArray(params) ? params : [params];
					const axis = (items[0] as { axisValue?: string; name?: string } | undefined)?.axisValue
						?? (items[0] as { name?: string } | undefined)?.name
						?? '';
					const filas = items
						.filter((item): item is { marker?: string; seriesName?: string; value?: number } =>
							Boolean(item && typeof item === 'object')
						)
						.map(
							(item) =>
								`${item.marker ?? ''} ${item.seriesName ?? ''}: <b>${currency.format(Number(item.value) || 0)}</b>`
						);

					return [axis, ...filas].join('<br/>');
				}
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '8%',
				top: grouped ? '32%' : '25%',
				containLabel: true
			},
			xAxis: {
				type: 'category',
				data: chartData.categorias,
				axisLabel: {
					interval: 0
				}
			},
			yAxis: {
				type: 'value',
				name: 'USD',
				axisLabel: {
					formatter: (value: number) => currency.format(value)
				}
			},
			series: chartData.series.map((serie, index) => ({
				name: serie.name,
				type: 'bar',
				barMaxWidth: grouped ? 28 : 55,
				data: serie.data,
				label: grouped
					? { show: false }
					: {
							show: true,
							position: 'top',
							formatter: (params: { value?: number }) => currency.format(Number(params.value) || 0)
						},
				itemStyle: {
					color: PALETTE[index % PALETTE.length],
					borderRadius: [6, 6, 0, 0]
				},
				emphasis: {
					focus: 'series'
				}
			}))
		};

		chart.setOption(option, true);
	});
</script>

<div class="pan honey grafica admin-border">
	<div class="header">
		<div class="total-container">
			<span class="total-label">Total USD</span>
			<strong class="total-number">{currency.format(total)}</strong>
			{#if cargando}
				<span class="meta">Consultando tipo de cambio DOF…</span>
			{:else if errorTipoCambio}
				<span class="meta error">{errorTipoCambio}. Los montos MXN no se convierten.</span>
			{:else if fechaTipoCambio && tipoCambio}
				<span class="meta">FIX DOF {tipoCambio.toFixed(4)} · {fechaTipoCambio}</span>
			{/if}
		</div>

		{#if esAdmin}
			<label class="vista-select">
				<span>Agrupar</span>
				<select bind:value={vista}>
					<option value="total">Total</option>
					<option value="agente">Por agente</option>
					<option value="producto">Top 5 productos</option>
				</select>
			</label>
		{/if}
	</div>

	<div bind:this={chartContainer} style="width: 100%; height: 400px;"></div>
</div>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 16px;
		margin-bottom: 12px;
	}

	.total-container {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.total-label {
		font-size: 13px;
		color: #64748b;
	}

	.total-number {
		font-size: 28px;
		font-weight: 700;
		color: #1e293b;
	}

	.meta {
		font-size: 12px;
		color: #64748b;
	}

	.meta.error {
		color: #b45309;
	}

	.vista-select {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 12px;
		color: #64748b;
		font-weight: 600;
	}

	.vista-select select {
		border: none;
		background: #f1f5f9;
		color: #1e293b;
		font-weight: 600;
		padding: 8px 12px;
		border-radius: 8px;
		cursor: pointer;
	}
</style>
