import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Pedido {
  id_pedido: number;
  dni: string;
  id_ganado: string;
  tipo_carne: string;
  peso_kg: number;
  precio: number;
  descuento: number;
  total: number;
}

const CerrarVentaPage: React.FC = () => {
  const [dniFiltro, setDniFiltro] = useState("");
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const cargarPedidos = async (dni?: string) => {
    setLoading(true);
    try {
      const url = dni
        ? `http://localhost:3001/cierre-ventas/pedidos?dni=${dni}`
        : "http://localhost:3001/cierre-ventas/pedidos";

      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        setPedidos(data);
      } else {
        console.error("Error al cargar pedidos");
      }
    } catch (err) {
      console.error("Error de conexión", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const handleFiltrar = (e: React.FormEvent) => {
    e.preventDefault();
    cargarPedidos(dniFiltro.trim() || undefined);
  };

  return (
    <section className="h-full flex flex-col bg-stone-50">
      {/* Encabezado */}
      <div className="w-full bg-amber-800 text-white px-8 py-3 shadow">
        <h1 className="text-xl font-semibold tracking-wide text-center">
          CIERRE DE VENTAS – CERRAR VENTA
        </h1>
      </div>

      <div className="flex-1 px-6 py-6">
        {/* Filtro por DNI */}
        <form
          onSubmit={handleFiltrar}
          className="flex flex-col md:flex-row md:items-center gap-4 mb-6"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-800">
              id_cliente / DNI:
            </span>
            <input
              value={dniFiltro}
              onChange={(e) => setDniFiltro(e.target.value)}
              className="border border-stone-400 px-3 py-1 rounded-sm min-w-[220px]"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold border border-stone-900 shadow-[0_3px_0_0_rgba(0,0,0,1)]"
          >
            FILTRAR
          </button>
        </form>

        {/* Lista de pedidos */}
        <h2 className="font-semibold mb-2 text-stone-800">
          LISTA DE PEDIDOS
        </h2>

        <div className="border border-stone-800 overflow-auto bg-white">
          {loading ? (
            <div className="p-4 text-center text-stone-600">Cargando...</div>
          ) : pedidos.length === 0 ? (
            <div className="p-4 text-center text-stone-600">
              No hay pedidos para el criterio indicado.
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-stone-200 border-b border-stone-800">
                <tr>
                  <th className="px-3 py-2 border-r border-stone-400">DNI</th>
                  <th className="px-3 py-2 border-r border-stone-400">
                    id_ganado
                  </th>
                  <th className="px-3 py-2 border-r border-stone-400">
                    Tipo de carne
                  </th>
                  <th className="px-3 py-2 border-r border-stone-400">
                    Peso (kg)
                  </th>
                  <th className="px-3 py-2 border-r border-stone-400">
                    Precio
                  </th>
                  <th className="px-3 py-2 border-r border-stone-400">
                    Descuento
                  </th>
                  <th className="px-3 py-2 border-r border-stone-400">
                    Total
                  </th>
                  <th className="px-3 py-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id_pedido} className="border-t border-stone-300">
                    <td className="px-3 py-2 border-r border-stone-300">
                      {p.dni}
                    </td>
                    <td className="px-3 py-2 border-r border-stone-300">
                      {p.id_ganado}
                    </td>
                    <td className="px-3 py-2 border-r border-stone-300">
                      {p.tipo_carne}
                    </td>
                    <td className="px-3 py-2 border-r border-stone-300">
                      {p.peso_kg}
                    </td>
                    <td className="px-3 py-2 border-r border-stone-300">
                      S/ {p.precio.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 border-r border-stone-300">
                      S/ {p.descuento.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 border-r border-stone-300">
                      S/ {p.total.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        className="px-3 py-1 text-xs bg-white border border-stone-900 font-semibold shadow-[0_2px_0_0_rgba(0,0,0,1)]"
                        onClick={() =>
                          navigate(`/ventas/cerrar/${p.id_pedido}`)
                        }
                      >
                        INGRESAR PAGO
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
};

export default CerrarVentaPage;

