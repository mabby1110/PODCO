<script lang="ts">
    import * as echarts from 'echarts';

    interface Grupo {
        grupo: string;
        elementos: any[];
    }

    let { data, titulo, categoria }: { data: Grupo[]; titulo: string; categoria: string } = $props();
    let chartRef: HTMLDivElement | undefined = $state();

    $effect(() => {
        if (!chartRef || !data) return;

        const chart = echarts.init(chartRef);

        // Agrupa, suma la longitud de la categoría por cada elemento, ordena y extrae el top 10
        const procesados = data
            .map(g => ({
                nombre: g.grupo || 'Desconocido',
                valor: g.elementos.reduce((acc, el) => acc + (Array.isArray(el[categoria]) ? el[categoria].length : 0), 0)
            }))
            .sort((a, b) => b.valor - a.valor)
            .slice(0, 10)
            .reverse();

        chart.setOption({
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            grid: { left: '3%', right: '10%', top: '5%', bottom: '10%', containLabel: true },
            xAxis: { type: 'value', minInterval: 1 },
            yAxis: {
                type: 'category',
                data: procesados.map(p => p.nombre),
                axisLabel: { width: 120, overflow: 'truncate' }
            },
            series: [{
                name: categoria,
                type: 'bar',
                data: procesados.map(p => p.valor),
                label: { show: true, color: '#000' },
                itemStyle: { color: 'var(--color-1, #5470c6)' }
            }]
        });

        const handleResize = () => chart.resize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.dispose();
        };
    });
</script>

<div class="contenedor-grafica" style="display: flex; flex-direction: column; height: 100%; width: 100%;">
    <h1>{categoria} x {titulo}</h1>
    <div bind:this={chartRef} style="flex: 1; min-height: 300px;"></div>
</div>