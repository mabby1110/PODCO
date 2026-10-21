export type TipoEvento = 'oportunidad' | 'actividad';

export interface Origen {
	tipo: TipoEvento;
	id: string;
}

interface OpenParams {
	destino: TipoEvento; // qué se va a crear
	origen: Origen; // desde dónde se crea (actividad u oportunidad actual)
	index_entrada: number;
	observaciones: string;
	id_cliente?: string;
	onSuccess: (id: string) => void;
}

interface EventoModalState {
	destino: TipoEvento | null;
	origen: Origen | null;
	index_entrada: number;
	observaciones: string;
	id_cliente: string;
	onSuccess: ((id?: string) => void) | null;
	open: (params: OpenParams) => void;
	clearStore: () => void;
}

export const StoreEntradas: EventoModalState = $state({
	destino: null,
	origen: null,
	index_entrada: -1,
	observaciones: '',
	id_cliente: '',
	onSuccess: null,

	open({ destino, origen, index_entrada, observaciones, id_cliente = '', onSuccess }) {
		this.destino = destino;
		this.origen = origen;
		this.index_entrada = index_entrada;
		this.observaciones = observaciones;
		this.id_cliente = id_cliente;
		this.onSuccess = onSuccess;
	},

	clearStore() {
		this.destino = null;
		this.origen = null;
		this.index_entrada = -1;
		this.observaciones = '';
		this.id_cliente = '';
		this.onSuccess = null;
	}
});