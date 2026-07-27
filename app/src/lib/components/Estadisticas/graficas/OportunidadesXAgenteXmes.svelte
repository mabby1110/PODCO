<script lang="ts">
    import * as echarts from 'echarts';
    
    let {data} = $props();

    let lista_agrupada = $derived(data);
    console.log(lista_agrupada);
    let chartRef: HTMLDivElement;

    $effect(() => {
        if (!chartRef || !Array.isArray(lista_agrupada) || lista_agrupada.length === 0) return;

        const chart = echarts.init(chartRef);

        // Eje X estático de 12 meses
        const mesesEjeX = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        const labelOption = {
            show: true,
            position: 'insideBottom',
            distance: 15,
            align: 'left',
            verticalAlign: 'middle',
            formatter: '{c}',
            fontSize: 16
        };

        const series = lista_agrupada.map(({ grupo, elementos }, index) => {
            const data = mesesEjeX.map((_, i) => {
                if (!Array.isArray(elementos)) return 0;
                
                // Generar string del mes esperado ("01" a "12")
                const mesTarget = String(i + 1).padStart(2, '0');
                
                return elementos.filter((el: any) => {
                    // Extraer mes desde índice 5 del formato "YYYY-MM-DD..."
                    return el.fecha_creacion && el.fecha_creacion.substring(5, 7) === mesTarget;
                }).length;
            });

            
            const nombreGrupo = elementos[0]?.profiles?.nombre || grupo;
            
            return {
                name: nombreGrupo,
                type: 'bar',
                label: labelOption,
                emphasis: { focus: 'series' },
                data
            };
        });
        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            legend: {
                data: series.map(s => s.name)
            },
            toolbox: {
                show: true,
                orient: 'vertical',
                left: 'right',
                top: 'center',
                feature: {
                    mark: { show: true },
                    dataView: { show: true, readOnly: false },
                    magicType: { show: true, type: ['line', 'bar', 'stack'] },
                    restore: { show: true },
                    saveAsImage: { show: true }
                }
            },
            xAxis: [
                {
                    type: 'category',
                    axisTick: { show: false },
                    data: mesesEjeX
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series
        };

        chart.setOption(option);

        const handleResize = () => chart.resize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.dispose();
        };
    });
</script>

<div class="contenedor-grafica" style="width: 100%; height: 500px;">
    <div bind:this={chartRef} style="width: 100%; height: 100%;"></div>
</div>