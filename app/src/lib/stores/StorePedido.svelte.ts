export interface Objeto {
	id: string;
	[key: string]: any;
}

export interface PedidoSelecionado {
	pedido?: Objeto | null;
}

class Pedido {
	items = $state<PedidoSelecionado[]>([]);

	agregar(pedido: Objeto) {
		const existente = this.items.find((i) => i.pedido?.id === pedido.id);

		if (existente && existente.pedido) {
			if (existente.pedido.inventario?.cantidad) {
				if (existente.pedido.cantidad < existente.pedido.inventario.cantidad) {
					existente.pedido.cantidad += 1;
				}
			} else {
				existente.pedido.cantidad += 1;
			}
		} else {
			this.items.push({ pedido: { ...pedido } });
		}
	}

	quitar(pedido: Objeto) {
		const indice = this.items.findIndex((i) => i.pedido?.id === pedido.id);
		if (indice !== -1) {
			this.items[indice].pedido.cantidad -= 1;
			if (this.items[indice].pedido.cantidad <= 0) {
				this.items.splice(indice, 1);
			}
		}
	}
	eliminar(pedido: Objeto) {
		const indice = this.items.findIndex((i) => i.pedido?.id === pedido.id);
		if (indice !== -1) {
			this.items.splice(indice, 1);
		}
	}
	obtenerCantidad(id_producto: string): number {
		return this.items.find((i) => i.pedido?.id_producto === id_producto)?.pedido?.cantidad || 0;
	}

	limpiar() {
		this.items = [];
	}
}

export const StorePedido = new Pedido();
