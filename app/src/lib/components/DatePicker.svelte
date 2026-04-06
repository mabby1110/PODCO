<script lang="ts">
    import { addMinutes } from '$lib/utils/agenda';
    
    const { title = '' } = $props();
    
    let fecha = $state('');
    let duracion = $state(20);
    let hora = $state('10:00');

    let inicio = $derived(fecha && hora ? `${fecha} ${hora}` : '');
    let fin = $derived(fecha && hora ? setCustomEnd(new Date(`${fecha}T${hora}`), duracion) : '');

    function setCustomEnd(fechaCompromiso: Date, min: number = 10) {
        const next = addMinutes(fechaCompromiso, min);

        const yyyy = next.getFullYear();
        const mm = String(next.getMonth() + 1).padStart(2, '0');
        const dd = String(next.getDate()).padStart(2, '0');
        const hh = String(next.getHours()).padStart(2, '0');
        const mi = String(next.getMinutes()).padStart(2, '0');

        return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    }

    // Al ser un cálculo estático, no necesita reactividad interna
    const horasGeneradas = (() => {
        const horas: string[] = [];
        let actual = 8 * 60;
        const limite = 18 * 60;
        const paso = 10; // Intervalo fijo de 10 minutos

        while (actual <= limite) {
            const hh = String(Math.floor(actual / 60)).padStart(2, '0');
            const mm = String(actual % 60).padStart(2, '0');
            horas.push(`${hh}:${mm}`);
            actual += paso;
        }
        return horas;
    })();
</script>

<label>
    {#if title}
        <h3>{title}</h3>
    {/if}

    <div class="datetime-split">
        <div class="datetime-item">
            <span>Fecha</span>
            <input class="butter" type="date" bind:value={fecha} required />
        </div>
        <div class="datetime-item">
            <span>Hora</span>
            <select class="butter" bind:value={hora} required>
                {#each horasGeneradas as h}
                    <option value={h}>{h}</option>
                {/each}
            </select>
        </div>
        <div class="datetime-item">
            <span>Duración (minutos)</span>
            <input class="butter" type="number" bind:value={duracion} required />
        </div>
    </div>

    <input type="hidden" name="inicio" value={inicio} />
    <input type="hidden" name="fin" value={fin} />
</label>