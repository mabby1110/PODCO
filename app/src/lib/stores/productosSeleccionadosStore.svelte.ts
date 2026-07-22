export interface DatosProducto {
	id: string;
	[key: string]: any;
}

export interface ProductoKardex {
	pedido?: string;
	producto?: DatosProducto | null;
	piezas: number;
}

class Productos {
	items = $state<ProductoKardex[]>([]);

	agregar(producto: DatosProducto, pedido?: string) {
		const existente = this.items.find((i) => i.producto.id === producto.id);
		if (existente) {
			if (producto.cantidad > existente.piezas) {
				existente.piezas += 1;
			}
		} else {
			this.items.push({ producto, piezas: 1, pedido });
		}
	}

	quitar(producto: DatosProducto) {
		const indice = this.items.findIndex((i) => i.producto.id === producto.id);
		if (indice !== -1) {
			this.items[indice].piezas -= 1;
			if (this.items[indice].piezas <= 0) {
				this.items.splice(indice, 1);
			}
		}
	}

	obtenerCantidad(id_producto: string): number {
		return this.items.find((i) => i.producto.id === id_producto)?.piezas || 0;
	}

	limpiar() {
		this.items = [];
	}
}

export const productosSeleccionadosStore = new Productos();
