import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface DetallePedido {
  nro: number;
  id_ganado: string;
  tipo_carne: string;
  peso_kg: number;
  precio: number;
}

interface DetalleVenta {
  id_venta: number;
  cod_venta: string;
  fecha: string;
  hora: string;
  dni: string;
  nombre: string;
  items: DetallePedido[];
  subtotal: number;
  descuento: number;
  monto: number;
}

const DetalleHistorialVentaPage: React.FC = () => {
  const { idVenta } = useParams<{ idVenta: string }>();
  const [venta, setVenta] = useState<DetalleVenta | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const cargarDetalle = async () => {
    if (!idVenta) return;
    setLoading(true);
    try {
      // TODO: ajusta a tu endpoint real
      const resp = await fetch(
        `http://localhost:3001/cierre-ventas/historial/${idVenta}`
      );
      if (resp.ok) {
        const data = await resp.json();
        setVenta(data);
      } else {
        console.error("Error al cargar detalle de venta");
      }
    } catch (err) {
      console.error("Error de conexión", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDetalle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idVenta]);

  if (loading) {
    return (
      <section className="h-full flex items-center justify-center bg-stone-50">
        <div className="text-stone-600">Cargando detalle de venta...</div>
      </section>
    );
  }

  if (!venta) {
    return (
      <section className="h-full flex flex-col bg-stone-50">
        <div className="w-full bg-amber-800 text-white px-8 py-3 shadow">
          <h1 className="text-xl font-semibold tracking-wide">
            CIERRE DE VENTAS – DETALLE DE VENTA
          </h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="mb-4 text-stone-700">
            No se encontró información para la venta seleccionada.
          </p>
          <button
            onClick={() => navigate("/ventas/historial")}
            className="px-6 py-2 bg-white border border-stone-900 font-semibold
                       shadow-[0_3px_0_0_rgba(0,0,0,1)]"
          >
            REGRESAR
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="h-full flex flex-col bg-stone-50">
      {/* Encabezado */}
      <div className="w-full bg-amber-800 text-white px-8 py-3 shadow">
        <h1 className="text-xl font-semibold tracking-wide">
          CIERRE DE VENTAS – HISTORIAL DE VENTAS
        </h1>
      </div>

      <div className="flex-1 px-6 py-6 flex flex-col gap-6">
        <h2 className="text-center font-semibold text-stone-800">
          DETALLES DE VENTA
        </h2>

        {/* Datos principales de la venta */}
        <div className="max-w-3xl mx-auto w-full bg-white border border-stone-800 px-6 py-4">
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div>
              <span className="font-semibold">cod_venta : </span>
              {venta.cod_venta}
            </div>
            <div>
              <span className="font-semibold">fecha : </span>
              {venta.fecha}
            </div>
            <div>
              <span className="font-semibold">hora : </span>
              {venta.hora}
            </div>
            <div>
              <span className="font-semibold">dni : </span>
              {venta.dni}
            </div>
            <div>
              <span className="font-semibold">nombre : </span>
              {venta.nombre}
            </div>
          </div>

          {/* Tabla de pedidos */}
          <div className="mt-4 border border-stone-800 overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-stone-200 border-b border-stone-800">
                <tr>
                  <th className="px-3 py-2 border-r border-stone-400">N°</th>
                  <th className="px-3 py-2 border-r border-stone-400">
                    id_ganado
                  </th>
                  <th className="px-3 py-2 border-r border-stone-400">
                    Tipo de carne
                  </th>
                  <th className="px-3 py-2 border-r border-stone-400">
                    Peso (kg)
                  </th>
                  <th className="px-3 py-2">Precio</th>
                </tr>
              </thead>
              <tbody>
                {venta.items.map((item) => (
                  <tr
                    key={item.nro}
                    className="border-t border-stone-300"
                  >
                    <td className="px-3 py-2 border-r border-stone-300">
                      {item.nro}
                    </td>
                    <td className="px-3 py-2 border-r border-stone-300">
                      {item.id_ganado}
                    </td>
                    <td className="px-3 py-2 border-r border-stone-300">
                      {item.tipo_carne}
                    </td>
                    <td className="px-3 py-2 border-r border-stone-300">
                      {item.peso_kg} Kg
                    </td>
                    <td className="px-3 py-2">
                      S/ {item.precio.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="mt-4 text-sm space-y-1">
            <div>
              <span className="font-semibold">Sub total : </span>
              S/ {venta.subtotal.toFixed(2)}
            </div>
            <div>
              <span className="font-semibold">Descuento : </span>
              S/ {venta.descuento.toFixed(2)}
            </div>
            <div>
              <span className="font-semibold">Monto : </span>
              S/ {venta.monto.toFixed(2)}
            </div>
          </div>

          {/* Botones */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-white border border-stone-900 font-semibold
                         shadow-[0_3px_0_0_rgba(0,0,0,1)]"
            >
              IMPRIMIR
            </button>
            <button
              onClick={() => navigate("/ventas/historial")}
              className="px-6 py-2 bg-white border border-stone-900 font-semibold
                         shadow-[0_3px_0_0_rgba(0,0,0,1)]"
            >
              REGRESAR
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetalleHistorialVentaPage;
