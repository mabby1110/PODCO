// OBJETOS
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
	id_agente: string;
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
	id?: string;
	fecha_creacion: string | Date;
	historial_cambios?: string;
	id_contpaqi?: string;
	id_agente: string;
	razon_social: string;
	nombre_comercial: string;
	ubicacion: string;
	estado: string;
	ciudad: string;
	sector: string;
	contactos: string;
	tipo_prospeccion: string;
	ultima_actualizacion?: string | Date;
	historial: string;
	observaciones?: string;
};
export type Historial = {
	id?: string;
	fecha_creacion: string | Date;
	id_agente: string;
	tipo_objeto: string;
	id_objeto: string;
	accion: string;
	cambios: any;
};
export type Notificacion = {
	id: string;
	fecha_creacion: string | Date;
	id_agente: string;
	id_historial: string;
	visto: boolean;
};
export type Cotizacion = {
	id: string;
	fecha_creacion: string | Date;
	titulo: string;
	url: string;
	preview: string;
	id_agente: string;
	id_cliente: string;
	id_oportunidad: string;
	id_actividad: string;
	tipo: string;
};
// MAPEO CON SHEETS
export const historialFieldMap = {
	fecha_creacion: 'B',
	id_agente: 'C',
	tipo_objeto: 'D',
	id_objeto: 'E',
	accion: 'F',
	cambios: 'G'
};
export const clienteFieldMap = {
	fecha_creacion: 'B',
	historial_cambios: 'C',
	id_contpaqi: 'D',
	id_agente: 'E',
	razon_social: 'F',
	nombre_comercial: 'G',
	sector: 'H',
	estado: 'I',
	ciudad: 'J',
	ubicacion: 'K',
	contactos: 'L',
	descripcion: 'M',
	tipo_prospeccion: 'N',
	observaciones: 'O',
	cp: 'P',
	pagina_web: 'Q'
};
export const opFieldMap = {
	fecha_creacion: 'B',
	historial_cambios: 'C',
	inicio: 'D',
	fin: 'E',
	fecha_cierre: 'F',
	id_agente: 'G',
	fase: 'H',
	documentos: 'I',
	historia: 'J',
	motivo: 'K',
	objetivo: 'L',
	requisitos: 'M',
	observaciones: 'N',
	necesidades: 'O',
	potencial_venta: 'P',
	id_cliente: 'Q',
	cotizaciones_presentadas: 'R',
	cotizaciones_ganadas: 'S',
	oc_cliente: 'T',
	documentos_operacion: 'U',
	motivo_inicial: 'V',
	etiquetas: 'W',
	monto_oc: 'X',
	fecha_analisis: 'Y',
	fecha_negociacion: 'Z',
	fecha_pedido: 'AA',
	fecha_proceso_entrega: 'AB',
	fecha_transito: 'AC',
	fecha_entrega: 'AD'
};
export const actFieldMap = {
	fecha_creacion: 'B',
	historial_cambios: 'C',
	inicio: 'D',
	fin: 'E',
	fecha_cierre: 'F',
	id_agente: 'G',
	fase: 'H',
	documentos: 'I',
	historia: 'J',
	motivo: 'K',
	objetivo: 'L',
	requisitos: 'M',
	observaciones: 'N'
};

// FILTROS
export const categoriasActividad = [
	{ key: 'id', label: 'id' },
	{ key: 'motivo', label: 'Motivo' },
	{ key: 'objetivo', label: 'Objetivo' },
	{ key: 'inicio', label: 'Fecha Inicio' },
	{ key: 'fase', label: 'Fase' },
	{ key: 'historia', label: 'Historia' }
];
export const categoriasOportunidad = [
	{ key: 'id', label: 'id' },
	{ key: 'motivo', label: 'Motivo de Op.' },
	{ key: 'historia', label: 'Historia' },
	{ key: 'potencial_venta', label: 'Potencial de venta' },
	{ key: 'fase', label: 'Fase' },
	{ key: 'inicio', label: 'Fecha Inicio' },
	{ key: 'necesidades', label: 'Necesidades' },
	{ key: 'objetivo', label: 'Objetivo' }
];
export const categoriasCalendario = [
	{ key: 'id', label: 'id' },
	{ key: 'motivo', label: 'Motivo' },
	{ key: 'objetivo', label: 'Objetivo' },
	{ key: 'inicio', label: 'Fecha Inicio' },
	{ key: 'fase', label: 'Fase' },
	{ key: 'historia', label: 'Historia' }
];
export const categoriasCliente = [
	{ key: 'id', label: 'id' },
	{ key: 'razon_social', label: 'Razón Social' },
	{ key: 'nombre_comercial', label: 'Nombre Comercial' },
	{ key: 'sector', label: 'Sector/Industria' },
	{ key: 'ciudad', label: 'Ciudad' },
	{ key: 'estado', label: 'Estado' },
	{ key: 'tipo_prospeccion', label: 'Origen/Prospección' },
	{ key: 'op', label: 'Oportunidades abiertas' },
	{ key: 'visitas', label: 'Visitas' },
	{ key: 'contactos', label: 'Contactos' }
];
export const categoriasDocumentos = [
	{ key: 'id', label: 'id' },
	{ key: 'fecha_creacion', label: 'fecha_creacion' },
	{ key: 'titulo', label: 'titulo' },
	// {key: 'url', label:'url'},
	// {key: 'preview', label:'preview'},
	{ key: 'id_agente', label: 'id_agente' },
	{ key: 'id_oportunidad', label: 'id_oportunidad' },
	{ key: 'id_actividad', label: 'id_actividad' },
	{ key: 'tipo', label: 'tipo' }
];
export const categoriasInventario = [
	{ key: 'id', label: 'id' },
	{ key: 'categorias', label: 'categorias' },
	{ key: 'codigo', label: 'codigo' },
	{ key: 'descripcion', label: 'descripcion' },
	{ key: 'ubicacion_fisica', label: 'ubicacion_fisica' },
];

// AGRUPACIONES
export const agrupacionesCliente = [
	{ value: 'estado', label: 'Estado' },
	{ value: 'ciudad', label: 'Ciudad' },
	{ value: 'sector', label: 'Sector' },
	{ value: 'tipo_prospeccion', label: 'Tipo_prospeccion' },
	{ value: 'clasificacion', label: 'Clasificacion' }
];
export const agrupacionesActividades = [
	// del sistema
	{ value: 'fecha_creacion', label: 'fecha_creacion' },
	{ value: 'inicio', label: 'inicio' },
	{ value: 'fecha_cierre', label: 'fecha_cierre' },
	{ value: 'fase', label: 'fase' },

	// de la actividad
	{ value: 'motivo', label: 'motivo' }
];
export const agrupacionesOportunidades = [
	// del sistema
	{ value: 'fecha_creacion', label: 'fecha_creacion' },
	{ value: 'inicio', label: 'inicio' },
	{ value: 'fecha_cierre', label: 'fecha_cierre' },
	{ value: 'fase', label: 'fase' },

	// de la actividad
	{ value: 'motivo', label: 'motivo' },
	{ value: 'requisitos', label: 'requisitos' },
	{ value: 'id_cliente', label: 'id_cliente' }
];
export const agrupacionesCalendario = [
	{ value: 'fase', label: 'fase' },
	{ value: 'motivo', label: 'motivo' }
];
export const agrupacionesInventario = [
	// {value: 'id', label:'id'},
	{ value: 'categorias', label: 'categorias' },
	{ value: 'ubicacion_fisica', label: 'ubicacion_fisica' },
];
export const agrupacionesDocumentos = [
	// {value: 'id', label:'id'},
	{ value: 'fecha_creacion', label: 'fecha_creacion' },
	{ value: 'titulo', label: 'titulo' },
	// {value: 'url', label:'url'},
	// {value: 'preview', label:'preview'},
	{ value: 'id_agente', label: 'id_agente' },
	{ value: 'id_oportunidad', label: 'id_oportunidad' },
	{ value: 'id_actividad', label: 'id_actividad' },
	{ value: 'tipo', label: 'tipo' }
];

// FASES
export const fases = [
	{
		id_fase: 1,
		actual: 'Oportunidad',
		accion: 'Analizar',
		placeholder: 'Actividad con un cliente especifico.'
	},
	{
		id_fase: 2,
		actual: 'Analisis',
		accion: 'Negociar',
		placeholder: 'Validar alcance, condiciones técnicas y viabilidad comercial'
	},
	{
		id_fase: 3,
		actual: 'Negociacion',
		accion: 'Ganar',
		placeholder: 'Motivos de conversión'
	},
	{
		id_fase: 4,
		actual: 'Ganada',
		accion: 'Proceso de envío',
		placeholder: 'O.C BMS a proveedor (reconocimiento si hay) y documentos logistica'
	},
	{
		id_fase: 5,
		actual: 'En proceso de entrega',
		accion: 'En transito',
		placeholder:
			'Proceso de logística, reunir el material vendido, esperar material pedido al proveedor y corroborar condiciones'
	},
	{
		id_fase: 6,
		actual: 'En transito',
		accion: 'Pedido entregado',
		placeholder: 'Cerrar ciclo y documentar resultados y aprendizajes'
	},
	{
		id_fase: 7,
		actual: 'Pedido entregado',
		accion: 'Pendiente por cobrar',
		placeholder: 'Cerrar ciclo y documentar resultados y aprendizajes'
	},
	{
		id_fase: 8,
		actual: 'Oportunidad finalizada',
		accion: '',
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
	'Servicio especializado en sitio',
	'Prospeccion local',
	'Prospeccion foranea',
	'Visita técnica',
	'Recolección',
	'Entrega de pedido',
	'Instalación',
	'Prospección telefónica/digital',
	'Evento / Feria / Exposición',
	'vacaciones'
];
export let motivosOportunidad = [
	'Cotización',
	'Visita técnica',
	'Refacciones',
	'Reabastecimiento',
	'Seguimiento de propuesta',
	'Presentación de portafolio',
	'Propuesta de negocio',
	'Proyecto nuevo',
	'Ampliación de proyecto',
	'Licitación',
	'Solicitud de servicio'
];
export let motivosProspeccion = [
	'Prospección telefónica',
	'Prospección digital',
	'Prospección local con cita',
	'Prospección local en frio',
	'Prospección foranea con cita',
	'Prospección foranea en frio',
	'Referido',
	'Formulario Web de BMS',
	'Whatsapp de BMS',
	'Prospeccion inbound ',
	'Evento / Feria / Exposición',
	'Reactivación de cliente'
];
