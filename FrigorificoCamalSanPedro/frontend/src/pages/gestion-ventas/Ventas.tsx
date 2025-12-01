// frontend/src/pages/gestion-ventas/Ventas.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

const VentasMenu: React.FC = () => {
  const navigate = useNavigate();

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
      </div>
    </section>
  );
};

export default VentasMenu;
