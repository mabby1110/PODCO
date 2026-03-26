export type Actividad = {
	// del sistema
	id: string;
	fecha_creacion: string | Date;
	historial_cambios: string;
	inicio: string | Date;
	fin: string | Date;
	fecha_cierre: string | Date;
	id_agente: string;
	fase: number;
	documentos: string;

	// de la actividad
	historia: string;
	motivo: string;
	objetivo: string;
	requisitos: string;
	observaciones: string;
};
export type Oportunidad = {
	// del sistema
	id: string;
	fecha_creacion: string | Date;
	historial_cambios: string;
	inicio: string | Date;
	fin: string | Date;
	fecha_cierre: string | Date;
	fase: number;
	documentos: string;

	// de la actividad
	historia: string;
	motivo: string;
	objetivo: string;
	requisitos: string;
	observaciones: string;

	// de la oportunidad
	necesidades: string;
	potencial_venta: string;
	id_cliente: string | null;
	cotizaciones_presentadas: string | null;
	cotizaciones_ganadas: string | null;
	oc_cliente: string | null;
	documentos_operacion: string | null;
};
export type Cliente = {
	id: string;
	fecha_creacion: string | Date;
	historial_cambios: string;
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
	ultima_actualizacion: string | Date;
	historial: string;
	observaciones: string;
};

// FILTROS
export const columnasActividad = [
	{ key: 'motivo', label: 'Motivo' },
	{ key: 'objetivo', label: 'Objetivo' },
	{ key: 'inicio', label: 'Fecha Inicio' },
	{ key: 'fase', label: 'Fase' },
	{ key: 'historia', label: 'Historia' }
];

export const columnasOportunidad = [
	{ key: 'motivo', label: 'Motivo de Op.' },
	{ key: 'historia', label: 'Historia' },
	{ key: 'potencial_venta', label: 'Potencial de venta' },
	{ key: 'fase', label: 'Fase' },
	{ key: 'inicio', label: 'Fecha Inicio' },
	{ key: 'necesidades', label: 'Necesidades' },
	{ key: 'objetivo', label: 'Objetivo Comercial' }
];

export const columnasCalendario = [
	{ key: 'motivo', label: 'Motivo' },
	{ key: 'objetivo', label: 'Objetivo' },
	{ key: 'inicio', label: 'Fecha Inicio' },
	{ key: 'fase', label: 'Fase' },
	{ key: 'historia', label: 'Historia' }
];

export const columnasCliente = [
	{ key: 'razon_social', label: 'Razón Social' },
	{ key: 'nombre_comercial', label: 'Nombre Comercial' },
	{ key: 'sector', label: 'Sector/Industria' },
	{ key: 'ciudad', label: 'Ciudad' },
	{ key: 'estado', label: 'Estado' },
	{ key: 'tipo_prospeccion', label: 'Origen/Prospección' }
];

// AGRUPACIONES
export const agrupacioneCliente = [
	{ value: 'fecha_creacion', label: 'fecha_creacion' },
	{ value: 'estado', label: 'estado' },
	{ value: 'ciudad', label: 'ciudad' },
	{ value: 'sector', label: 'sector' },
	{ value: 'tipo_prospeccion', label: 'tipo_prospeccion' },
	{ value: 'ultima_actualizacion', label: 'ultima_actualizacion' }
];

export const agrupacioneActividades = [
	// del sistema
	{ value: 'fecha_creacion', label: 'fecha_creacion' },
	{ value: 'inicio', label: 'inicio' },
	{ value: 'fecha_cierre', label: 'fecha_cierre' },
	{ value: 'fase', label: 'fase' },

	// de la actividad
	{ value: 'motivo', label: 'motivo' },
	{ value: 'tipo_actividad', label: 'tipo_actividad' }
];

export const agrupacioneOportunidades = [
	// del sistema
	{ value: 'fecha_creacion', label: 'fecha_creacion' },
	{ value: 'inicio', label: 'inicio' },
	{ value: 'fecha_cierre', label: 'fecha_cierre' },
	{ value: 'fase', label: 'fase' },
	
	// de la actividad
	{ value: 'motivo', label: 'motivo' },
	{ value: 'requisitos', label: 'requisitos' },
	{ value: 'tipo_actividad', label: 'tipo_actividad' },
	{ value: 'id_cliente', label: 'id_cliente' }
];

// FASES
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

// MOTIVOS
export let motivosActividades = [
	'Trabajo Administrativo',
	'Presentación de portafolio',
	'Propuesta de negocio',
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
	'Evento / Feria / Exposición',
	'Reactivación de cliente',
	'vacaciones'
];
export let motivosOportunidad = [
	'Presentación de portafolio',
	'Propuesta de negocio',
	'Seguimiento de propuesta ',
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
