export interface Objeto {
    id: string;
    [key: string]: any;
}

class EditarPedido {
    items = $state<Objeto[]>([]);
    itemsRemovidos = $state<Objeto[]>([]);

    agregar(pedido: Objeto) {
        const existe = this.items.some((i) => i.id === pedido.id);
        
        if (!existe) {
            this.items.push({ ...pedido });
        }

        const indiceRemovido = this.itemsRemovidos.findIndex((i) => i.id === pedido.id);
        if (indiceRemovido !== -1) {
            this.itemsRemovidos.splice(indiceRemovido, 1);
        }
    }

    remover(pedido: Objeto) {
        const indice = this.items.findIndex((i) => i.id === pedido.id);
        
        if (indice !== -1) {
            const [removido] = this.items.splice(indice, 1);
            this.itemsRemovidos.push(removido);
        }
    }
    eliminar(pedido: Objeto) {
        const indice = this.items.findIndex((i) => i.pedido?.id === pedido.id);
        if (indice !== -1) {
            this.items.splice(indice, 1);
        }
    }
    limpiar() {
        this.items = [];
        this.itemsRemovidos = [];
    }
}

export const StoreRelacionarPedido = new EditarPedido();