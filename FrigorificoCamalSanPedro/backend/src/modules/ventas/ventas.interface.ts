export interface Venta {
    _key?: string;
    _id?: string;
    _rev?: string;
    clienteId: number;
    clienteNombre?: string;
    fecha: string;
    items: {
        productoId: number;
        nombre: string;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
    }[];
    total: number;
    estado: 'pendiente' | 'pagado' | 'anulado';
}
