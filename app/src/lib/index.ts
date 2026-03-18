export type Oportunidad = {
	id: string;
	id_cliente: string;
	id_agente: string;
	fase: number;
	motivo: string | null;
	inicio: string;
	fin: string;
	historia: string | null;
	cotizaciones: string | null;
	requisitos: string;
	fecha_creacion: string;
	fecha_cierre: string | null;
	motivo_inicial: string | null;
	adjuntos: string | null;
	documentos: string | null;
	objetivo: string;
};
export type Actividad = {
	id: string;
	id_cliente: string;
	id_agente: string;
	fase: number;
	motivo: string;
	inicio: string | Date;
	fin: string | Date;
	historia: string;
	cotizaciones: string;
	requisitos: string;
	fecha_creacion: string | Date;
	fecha_cierre: string | Date;
	motivo_inicial: string;
	adjuntos: string;
	objetivo: string;
	observaciones: string;
	tipo_actividad: string;

};
export type Cliente = {
	id: string;
	id_contpaqi: string;
	id_agente: string;
	razon_social: string;
	nombre_comercial: string;
	ubicacion: string;
	estado: string;
	ciudad: string;
	sector: string;
	contactos: string;
	tipo_prospeccion: string;
	fecha_creacion: string | Date;
	ultima_actualizacion: string | Date;
	fecha_sync: string | Date;
};

export const fases = [
	{
		id_fase: 1,
		actual: 'Oportunidad',
		accion: 'Analizar',
		placeholder: 'Registrar datos iniciales y detectar una necesidad real'
	},
	{
		id_fase: 2,
		actual: 'Analisis',
		accion: 'Cotizar',
		placeholder: 'Validar alcance, condiciones técnicas y viabilidad comercial'
	},
	{
		id_fase: 3,
		actual: 'Negociacion',
		accion: 'Documentar',
		placeholder: 'Motivos de conversión'
	},
	{
		id_fase: 4,
		actual: 'Ganada',
		accion: 'Enviar',
		placeholder: 'Preparar productos y documentación para entrega'
	},
	{
		id_fase: 5,
		actual: 'En proceso de envio',
		accion: 'Finalizar',
		placeholder: 'Dar seguimiento a logística, entrega o ejecución del servicio'
	},
	{
		id_fase: 6,
		actual: 'Oportunidad finalizada',
		accion: 'Analizar',
		placeholder: 'Cerrar ciclo y documentar resultados y aprendizajes'
	},
	{
		id_fase: 0,
		actual: 'Perdida',
		accion: 'Analizar',
		placeholder: 'Registrar motivo de pérdida y lecciones para futuras oportunidades'
	}
];
export const fases_actividad = [
	{
		id_fase: 1,
		actual: 'Programada',
		accion: 'Finalizar',
		placeholder: 'Actividad agendada'
	},
	{
		id_fase: 6,
		actual: 'Finalizada',
		accion: '',
		placeholder: 'Actividad finalizada y registrada en el historial'
	},
	{
		id_fase: 0,
		actual: 'Cancelada',
		accion: 'Activar',
		placeholder: 'Actividad cancelada, se puede reactivar'
	}
];

export let motivosActividades = [
	'Trabajo Administrativo',
	'Trabajo en centro de servicio',
	'Servicio especializado en sitio',
	'Viaje de prospeccion local',
	'Viaje de prospeccion foraneo',
	'Visita técnica',
	'Trabajo en bodega',
	'Compras / refacciones',
	'Recolección de equipo',
	'Entrega de equipo',
	'Instalación',
	'Diagnóstico técnico',
	'Seguimiento administrativo',
	'Traslado / logística',
	'Prospección telefónica',
	'Prospección digital',
	'Visita con cita',
	'Visita sin cita',
	'Evento / Feria / Exposición',
	'Reactivación de cliente',
	'vacaciones'
];
export let motivosOportunidad = [
	'Visita técnica',
	'Diagnóstico',
	'Detección de necesidades',
	'Cotización',
	'Proyecto nuevo',
	'Ampliación de proyecto',
	'Negociación activa',
	'Licitación',
	'Renovación de contrato',
	'Compras / Refacciones',
  	'Servicio de mantenimiento'
];
export let motivosProspeccion = [
	'Prospección telefónica',
	'Prospección digital',
	'Prospección con cita',
	'Prospección en frio',
	'Referido',
	'Formulario Web',
	'Ventas / Información entrante',
	'Evento / Feria / Exposición',
	'Reactivación de cliente'
];

