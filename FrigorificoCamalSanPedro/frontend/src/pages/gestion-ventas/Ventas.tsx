<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../services/api';

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
      const response = await fetch(`${API_BASE_URL}/ventas`);
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
      const response = await fetch(`${API_BASE_URL}/ventas`, {
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
=======
// frontend/src/pages/gestion-ventas/Ventas.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const VentasMenu: React.FC = () => {
  const navigate = useNavigate();
>>>>>>> b7b8fd3264d3cfe9d0fa49487c1cc5903ed59289

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!confirm(`¿Estás seguro de cambiar el estado a ${newStatus}?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/ventas/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus })
      });

      if (response.ok) {
        fetchVentas();
      } else {
        alert('Error al actualizar estado');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error de conexión');
    }
  };

  return (
    <section className="min-h-full bg-stone-50">
      {/* SOLO el título de la sección interna */}
      <div className="bg-amber-800 text-white px-8 py-4 shadow">
        <h2 className="text-2xl font-semibold text-center">
          Cierre de Ventas
        </h2>
      </div>

      {/* Contenido */}
      <div className="px-6 py-8 max-w-6xl mx-auto">
        <header className="mb-8">
          <p className="text-sm font-semibold text-amber-900 tracking-[0.25em] uppercase">
            Módulo de cierre de ventas
          </p>
          <h3 className="mt-2 text-3xl font-semibold text-stone-900">
            Bienvenido al módulo de cierre de ventas.
          </h3>
        </header>

        {/* Tarjetas */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Cerrar Venta */}
          <article className="bg-white rounded-2xl border border-stone-100 shadow-card p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-semibold text-stone-900">
                Cerrar venta
              </h4>
              <p className="mt-2 text-sm text-stone-600">
                Registrar el pago de pedidos pendientes y generar la venta
                asociada al cliente.
              </p>
            </div>
            <div className="mt-6">
              <button
                onClick={() => navigate("/ventas/cerrar")}
                className="w-full inline-flex items-center justify-center px-4 py-2 rounded-full
                           bg-amber-800 text-white font-semibold shadow-lg shadow-amber-800/30
                           hover:brightness-110 transition"
              >
                Acceder
              </button>
            </div>
          </article>

          {/* Historial de Ventas */}
          <article className="bg-white rounded-2xl border border-stone-100 shadow-card p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-semibold text-stone-900">
                Historial de ventas
              </h4>
              <p className="mt-2 text-sm text-stone-600">
                Consultar ventas registradas por código, cliente, fecha y ver
                el detalle de cada operación.
              </p>
            </div>
            <div className="mt-6">
              <button
                onClick={() => navigate("/ventas/historial")}
                className="w-full inline-flex items-center justify-center px-4 py-2 rounded-full
                           bg-amber-800 text-white font-semibold shadow-lg shadow-amber-800/30
                           hover:brightness-110 transition"
              >
                Acceder
              </button>
            </div>
          </article>

          {/* Entrega de pedidos */}
          <article className="bg-white rounded-2xl border border-stone-100 shadow-card p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-semibold text-stone-900">
                Entrega de pedidos
              </h4>
              <p className="mt-2 text-sm text-stone-600">
                Mostrar pedidos pagados pendientes de entrega y autorizar la
                entrega al cliente.
              </p>
            </div>
            <div className="mt-6">
              <button
                onClick={() => navigate("/ventas/entrega")}
                className="w-full inline-flex items-center justify-center px-4 py-2 rounded-full
                           bg-amber-800 text-white font-semibold shadow-lg shadow-amber-800/30
                           hover:brightness-110 transition"
              >
                Acceder
              </button>
            </div>
          </article>
        </div>
<<<<<<< HEAD
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
                    <div className="flex flex-col gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold text-center uppercase ${venta.estado === 'pagado' ? 'bg-emerald-100 text-emerald-700' :
                        venta.estado === 'anulado' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                        {venta.estado}
                      </span>
                      {venta.estado === 'pendiente' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleStatusChange(venta._key!, 'pagado')}
                            className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                          >
                            Pagar
                          </button>
                          <button
                            onClick={() => handleStatusChange(venta._key!, 'anulado')}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
                          >
                            Anular
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
=======
>>>>>>> b7b8fd3264d3cfe9d0fa49487c1cc5903ed59289
      </div>
    </section>
  );
};

export default VentasMenu;
