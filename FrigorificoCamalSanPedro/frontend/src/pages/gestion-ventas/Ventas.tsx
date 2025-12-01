import { useState, useEffect } from 'react';

interface VentaItem {
  productoId: number;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

interface Venta {
  _key?: string;
  clienteId: number;
  clienteNombre?: string;
  fecha: string;
  items: VentaItem[];
  total: number;
  estado: 'pendiente' | 'pagado' | 'anulado';
}

const Ventas = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [documento, setDocumento] = useState('');
  const [items, setItems] = useState<VentaItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    nombre: '',
    cantidad: 1,
    precioUnitario: 0
  });

  const fetchVentas = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/ventas');
      if (response.ok) {
        const data = await response.json();
        setVentas(data);
      }
    } catch (error) {
      console.error('Error fetching ventas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentas();
  }, []);

  const addItem = () => {
    if (!currentItem.nombre || currentItem.precioUnitario <= 0) return;
    const newItem: VentaItem = {
      productoId: Date.now(), // Mock ID
      nombre: currentItem.nombre,
      cantidad: Number(currentItem.cantidad),
      precioUnitario: Number(currentItem.precioUnitario),
      subtotal: Number(currentItem.cantidad) * Number(currentItem.precioUnitario)
    };
    setItems([...items, newItem]);
    setCurrentItem({ nombre: '', cantidad: 1, precioUnitario: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documento || items.length === 0) return;

    setSubmitting(true);
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    const newVenta = {
      documento, // Send DNI/RUC instead of ID
      items,
      total
    };

    try {
      const response = await fetch('http://localhost:3000/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVenta)
      });

      if (response.ok) {
        setItems([]);
        setDocumento('');
        fetchVentas(); // Refresh list
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Al registrar venta'}`);
      }
    } catch (error) {
      console.error('Error creating venta:', error);
      alert('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-8 animate-in fade-in">
      <div>
        <h2 className="text-3xl font-semibold text-stone-900">Gestión de Ventas</h2>
        <p className="text-stone-600 mt-2">Registra y visualiza las ventas almacenadas en la base de datos NoSQL.</p>
      </div>

      {/* Formulario de Nueva Venta */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-card p-6">
        <h3 className="text-lg font-bold text-stone-800 mb-4">Nueva Venta</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">DNI / RUC Cliente</label>
              <input
                className="w-full rounded-lg border border-stone-300 px-3 py-2"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Ingrese documento"
                required
              />
            </div>
          </div>

          <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
            <h4 className="text-sm font-semibold text-stone-700 mb-3">Agregar Producto</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="block text-xs text-stone-500 mb-1">Producto</label>
                <input
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                  value={currentItem.nombre}
                  onChange={(e) => setCurrentItem({ ...currentItem, nombre: e.target.value })}
                  placeholder="Nombre del producto"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Cantidad</label>
                <input
                  type="number"
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                  value={currentItem.cantidad}
                  onChange={(e) => setCurrentItem({ ...currentItem, cantidad: Number(e.target.value) })}
                  min="1"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">Precio Unit.</label>
                <input
                  type="number"
                  className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm"
                  value={currentItem.precioUnitario}
                  onChange={(e) => setCurrentItem({ ...currentItem, precioUnitario: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-3 text-sm font-semibold text-primary hover:underline"
            >
              + Agregar Item
            </button>
          </div>

          {/* Lista de Items Agregados */}
          {items.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-stone-100">
                <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                  <tr>
                    <th className="px-4 py-2 text-left">Producto</th>
                    <th className="px-4 py-2 text-right">Cant.</th>
                    <th className="px-4 py-2 text-right">P. Unit</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm bg-white">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2">{item.nombre}</td>
                      <td className="px-4 py-2 text-right">{item.cantidad}</td>
                      <td className="px-4 py-2 text-right">S/ {item.precioUnitario.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right font-medium">S/ {item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-stone-50">
                    <td colSpan={3} className="px-4 py-2 text-right font-bold">Total</td>
                    <td className="px-4 py-2 text-right font-bold text-primary">
                      S/ {items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="px-6 py-2 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:brightness-110 transition disabled:opacity-50"
            >
              {submitting ? 'Registrando...' : 'Registrar Venta'}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Ventas Recientes */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h3 className="text-lg font-bold text-stone-800">Historial de Ventas</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-stone-500">Cargando ventas...</div>
        ) : ventas.length === 0 ? (
          <div className="p-8 text-center text-stone-500">No hay ventas registradas en ArangoDB.</div>
        ) : (
          <table className="min-w-full divide-y divide-stone-100">
            <thead className="bg-stone-50 text-xs uppercase tracking-widest text-stone-500">
              <tr>
                <th className="px-6 py-3 text-left">ID Venta (Key)</th>
                <th className="px-6 py-3 text-left">Cliente ID</th>
                <th className="px-6 py-3 text-left">Fecha</th>
                <th className="px-6 py-3 text-left">Items</th>
                <th className="px-6 py-3 text-left">Total</th>
                <th className="px-6 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {ventas.map((venta) => (
                <tr key={venta._key}>
                  <td className="px-6 py-4 font-mono text-xs text-stone-500">{venta._key}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-stone-900">{venta.clienteNombre || 'Desconocido'}</div>
                    <div className="text-xs text-stone-500">ID: {venta.clienteId}</div>
                  </td>
                  <td className="px-6 py-4 text-stone-500">
                    {new Date(venta.fecha).toLocaleDateString()} {new Date(venta.fecha).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4">
                    <ul className="list-disc list-inside text-xs text-stone-600">
                      {venta.items.map((item, i) => (
                        <li key={i}>{item.cantidad}x {item.nombre}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 font-bold text-stone-900">S/ {venta.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 uppercase">
                      {venta.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default Ventas;
