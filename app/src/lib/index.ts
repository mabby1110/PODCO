export const fases = [
	{
		id: 1,
		actual: 'Prospecto',
		accion: 'Analizar',
		placeholder: 'Registrar datos iniciales y detectar una necesidad real'
	},
	{
		id: 2,
		actual: 'Analisis',
		accion: 'Cotizar',
		placeholder: 'Validar alcance, condiciones técnicas y viabilidad comercial'
	},
	{
		id: 3,
		actual: 'Negociacion',
		accion: 'Documentar',
		placeholder: 'Cotizacion aceptada, Ajustes, Nuevas propuestas y/o Resolver objeciones'
	},
	{
		id: 4,
		actual: 'Ganada',
		accion: 'Enviar',
		placeholder: 'Confirmar cierre y preparar documentación de entrega'
	},
	{
		id: 5,
		actual: 'En proceso de envio',
		accion: 'Finalizar',
		placeholder: 'Dar seguimiento a logística, entrega o ejecución del servicio'
	},
	{
		id: 6,
		actual: 'Oportunidad finalizada',
		accion: 'Analizar',
		placeholder: 'Cerrar ciclo y documentar resultados y aprendizajes'
	},
	{
		id: 0,
		actual: 'Perdida',
		accion: 'Analizar',
		placeholder: 'Registrar motivo de pérdida y lecciones para futuras oportunidades'
	}
];
export let motivosOportunidad = [
	'Refacciones / repuestos',
	'Mantenimiento correctivo',
	'Mantenimiento preventivo',
	'Servicio en sitio',
	'Visita técnica',
	'Reclamación / garantía',
	'Viaje comercial',
	'Urgencia operativa',
	'Soporte técnico a ventas',
	'Prospección en frío',
	'Prospección inbound',
	'Referido',
	'Seguimiento de cliente',
	'Diagnóstico de necesidad',
	'Cotización solicitada',
	'Proyecto nuevo',
	'Ampliación de proyecto',
	'Licitación privada',
	'Licitación pública',
	'Negociación activa',
	'Renovación de contrato',
	'Recompra',
	'Postventa con oportunidad'
];

export let motivosProspeccion = [
	'Llamada en frío',
	'Visita en frío',
	'Búsqueda en internet',
	'LinkedIn',
	'Redes sociales',
	'Referido de cliente',
	'Referido interno',
	'Referido de proveedor',
	'Formulario web',
	'Campaña digital',
	'Correo entrante',
	'Llamada entrante',
	'WhatsApp entrante',
	'Servicio en sitio',
	'Emergencia operativa',
	'Feria / expo',
	'Evento industrial',
	'Capacitación / curso',
	'Reactivación de cliente'
];
export type Oportunidad = {
	id: string;
	id_cliente: string;
	id_agente: string;
	fase: number;
	motivo: string | null;
	inicio: string | Date;
	fin: string | Date;
	historia: string | null;
	cotizaciones: string | null;
	requisitos: string;
	fecha_creacion: string | Date;
	fecha_cierre: string | Date | null;
	motivo_inicial: string | null;
	adjuntos: string | null;
};

export type Cliente = {
	id: number;
	id_contpaqi: string;
	id_agente: string;
	razon_social: string;
	ubicacion: string | null;
	contactos: string | null;
	tipo_prospeccion: string;
	fecha_creacion: string | Date;
	ultima_actualizacion: string | Date;
	fecha_sync: string | Date | null;
};