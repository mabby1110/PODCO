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
	giro_comercial: string;
	tipo_prospeccion: string;
	ultima_actualizacion?: string | Date;
	historial: string;
	observaciones?: string;
	clasificacion?: string;
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
	id?: string;
	fecha_creacion: string | Date;
	id_agente: string;
	id_historial: string;
	visto: boolean;
	fecha_lectura: string | Date;
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
export type Pedido = {
	id: string;
	fecha_creacion: string | Date;
	inicio: string | Date;
	fin: string | Date;
	fecha_cierre: string | Date;
	id_agente: string;
	fase: number;
	historia: string;
	observaciones: string;
	fecha_pedido: string | Date;
	fecha_reconocimiento: string | Date;
	fecha_recepcion: string | Date;
	total: number;
	no_orden: string;
	id_oportunidad: string;
	id_producto: string;
	cantidad: string;
	stock: boolean;
	precio_unitario: string;
	id_agrupacion: string;
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
	{ key: 'id', label: 'id', type: 'string' },
	{ key: 'motivo', label: 'Motivo', type: 'string' },
	{ key: 'objetivo', label: 'Objetivo', type: 'string' },
	{ key: 'inicio', label: 'Fecha Inicio', type: 'string' },
	{ key: 'fase', label: 'Fase', type: 'string' },
	{ key: 'historia', label: 'Historia', type: 'string' }
];
export const categoriasOportunidad = [
	{ key: 'id', label: 'id', type: 'string' },
	{ key: 'motivo', label: 'Motivo de Op.', type: 'string' },
	{ key: 'historia', label: 'Historia', type: 'string' },
	{ key: 'potencial_venta', label: 'Potencial de venta', type: 'string' },
	{ key: 'fase', label: 'Fase', type: 'string' },
	{ key: 'inicio', label: 'Fecha Inicio', type: 'string' },
	{ key: 'necesidades', label: 'Necesidades', type: 'string' },
	{ key: 'objetivo', label: 'Objetivo', type: 'string' }
];
export const categoriasCalendario = [
	{ key: 'id', label: 'id', type: 'string' },
	{ key: 'motivo', label: 'Motivo', type: 'string' },
	{ key: 'objetivo', label: 'Objetivo', type: 'string' },
	{ key: 'inicio', label: 'Fecha Inicio', type: 'string' },
	{ key: 'fase', label: 'Fase', type: 'string' },
	{ key: 'historia', label: 'Historia', type: 'string' }
];
export const categoriasCliente = [
	{ key: 'id', label: 'id', type: 'string' },
	{ key: 'razon_social', label: 'Razón Social', type: 'string' },
	{ key: 'nombre_comercial', label: 'Nombre Comercial', type: 'string' },
	{ key: 'sector', label: 'Sector/Industria', type: 'string' },
	{ key: 'ciudad', label: 'Ciudad', type: 'string' },
	{ key: 'estado', label: 'Estado', type: 'string' },
	{ key: 'tipo_prospeccion', label: 'Origen/Prospección', type: 'string' },
	{ key: 'oportunidades', label: 'Oportunidades', type: 'string' },
	{ key: 'contactos', label: 'Contactos', type: 'string' }
];
export const categoriasDocumentos = [
	{ key: 'id', label: 'id', type: 'string' },
	{ key: 'fecha_creacion', label: 'fecha_creacion', type: 'string' },
	{ key: 'titulo', label: 'titulo', type: 'string' },
	// {key: 'url', label:'url',type: 'string'},
	// {key: 'preview', label:'preview',type: 'string'},
	{ key: 'id_agente', label: 'id_agente', type: 'string' },
	{ key: 'id_oportunidad', label: 'id_oportunidad', type: 'string' },
	{ key: 'id_actividad', label: 'id_actividad', type: 'string' },
	{ key: 'tipo', label: 'tipo', type: 'string' }
];
export const categoriasInventario = [
	{ key: 'id', label: 'id', type: 'string' },
	{ key: 'categorias', label: 'categorias', type: 'string' },
	{ key: 'codigo', label: 'codigo', type: 'string' },
	{ key: 'serie', label: 'serie', type: 'string' },
	{ key: 'cantidad', label: 'cantidad', type: 'string' },
	{ key: 'descripcion', label: 'descripcion', type: 'string' },
	{ key: 'ubicacion_fisica', label: 'ubicacion_fisica', type: 'string' }
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
	{ value: 'codigo', label: 'codigo' },
	{ value: 'ubicacion_fisica', label: 'ubicacion_fisica' }
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
		placeholder: 'Actividad con un cliente especifico.',
		color: 'b8c0d999'
	},
	{
		id_fase: 2,
		actual: 'Analisis',
		accion: 'Negociar',
		placeholder: 'Validar alcance, condiciones técnicas y viabilidad comercial',
		color: '5ca8ff99'
	},
	{
		id_fase: 3,
		actual: 'Negociacion',
		accion: 'Ganar',
		placeholder: 'Motivos de conversión',
		color: 'ffd70099'
	},
	{
		id_fase: 4,
		actual: 'Ganada',
		accion: 'Proceso de envío',
		placeholder: 'O.C BMS a proveedor (reconocimiento si hay) y documentos logistica',
		color: '34d76a99'
	},
	{
		id_fase: 5,
		actual: 'En proceso de entrega',
		accion: 'En transito',
		placeholder:
			'Proceso de logística, reunir el material vendido, esperar material pedido al proveedor y corroborar condiciones',
		color: '5ca8ffcc'
	},
	{
		id_fase: 6,
		actual: 'En transito',
		accion: 'Pedido entregado',
		placeholder: 'Cerrar ciclo y documentar resultados y aprendizajes',
		color: 'ffd700cc'
	},
	{
		id_fase: 7,
		actual: 'Pedido entregado',
		accion: 'Pendiente por cobrar',
		placeholder: 'Cerrar ciclo y documentar resultados y aprendizajes',
		color: '34d76acc'
	},
	{
		id_fase: 8,
		actual: 'Oportunidad finalizada',
		accion: '',
		placeholder: 'Cerrar ciclo y documentar resultados y aprendizajes',
		color: '000000ee'
	},
	{
		id_fase: 0,
		actual: 'Perdida',
		accion: 'Analizar',
		placeholder: 'Registrar motivo de pérdida y lecciones para futuras oportunidades',
		color: 'ff444499'
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
// COLORES
export const colorMap = {
	'0': 'var(--color-perdida);',
	'1': 'var(--color-prospecto);',
	'2': 'var(--color-analizar);',
	'3': 'var(--color-cotizar);',
	'4': 'var(--color-ganada);',
	'5': 'var(--color-enviar);',
	'6': 'var(--color-finalizar); color: var(--color-text-ob);'
};
