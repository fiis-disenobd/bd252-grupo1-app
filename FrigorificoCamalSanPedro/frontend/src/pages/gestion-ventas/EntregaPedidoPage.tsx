import React, { useEffect, useState } from "react";

interface EntregaPendiente {
  id_entrega: number;
  id_pedido: number;
  dni: string;
  id_ganado: string;
  tipo_carne: string;
  peso_kg: number;
  precio: number;
  descuento: number;
  total: number;
}

const EntregaPedidoPage: React.FC = () => {
  const [dniFiltro, setDniFiltro] = useState("");
  const [entregas, setEntregas] = useState<EntregaPendiente[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const cargarEntregas = async (dni?: string) => {
    setLoading(true);
    try {
      const url = dni && dni.trim().length > 0
        ? `http://localhost:3001/cierre-ventas/entregas-pendientes?dni=${dni}`
        : "http://localhost:3001/cierre-ventas/entregas-pendientes";

      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        setEntregas(data);
      } else {
        console.error("Error al cargar entregas");
      }
    } catch (err) {
      console.error("Error de conexión", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEntregas();
  }, []);

  const handleFiltrar = (e: React.FormEvent) => {
    e.preventDefault();
    cargarEntregas(dniFiltro.trim() || undefined);
  };

  const handleAutorizarEntrega = async () => {
    if (confirmId == null) return;

    setSubmitting(true);
    try {
      const resp = await fetch(
        `http://localhost:3001/cierre-ventas/entregas/${confirmId}/autorizar`,
        { method: "POST" }
      );

      if (resp.ok) {
        await cargarEntregas(dniFiltro.trim() || undefined);
        setConfirmId(null);
      } else {
        alert("Error al autorizar la entrega");
      }
    } catch (err) {
      console.error("Error de conexión", err);
      alert("Error de conexión al autorizar entrega");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="h-full flex flex-col bg-stone-50">
      {/* Encabezado */}
      <div className="w-full bg-amber-800 text-white px-8 py-3 shadow">
        <h1 className="text-xl font-semibold tracking-wide text-center">
          CIERRE DE VENTAS – ENTREGA DE PEDIDOS
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
            BUSCAR
          </button>
        </form>

        {/* Lista de pedidos pendientes de entrega */}
        <h2 className="font-semibold mb-2 text-stone-800">
          PENDIENTES POR ENTREGAR
        </h2>

        <div className="border border-stone-800 overflow-auto bg-white">
          {loading ? (
            <div className="p-4 text-center text-stone-600">Cargando...</div>
          ) : entregas.length === 0 ? (
            <div className="p-4 text-center text-stone-600">
              No hay pedidos pendientes de entrega.
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
                {entregas.map((e) => (
                  <tr key={e.id_entrega} className="border-t border-stone-300">
                    <td className="px-3 py-2 border-r border-stone-300">
                      {e.dni}
                    </td>
                    <td className="px-3 py-2 border-r border-stone-300">
                      {e.id_ganado}
                    </td>
                    <td className="px-3 py-2 border-r border-stone-300">
                      {e.tipo_carne}
                    </td>
                    <td className="px-3 py-2 border-r border-stone-300">
                      {e.peso_kg}
                    </td>
                    <td className="px-3 py-2 border-r border-stone-300">
                      S/ {e.precio.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 border-r border-stone-300">
                      S/ {e.descuento.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 border-r border-stone-300">
                      S/ {e.total.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        className="px-3 py-1 text-xs bg-white border border-stone-900 font-semibold shadow-[0_2px_0_0_rgba(0,0,0,1)]"
                        onClick={() => setConfirmId(e.id_entrega)}
                      >
                        autorizar entrega
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Botón regresar (vuelve a /ventas) */}
        <div className="mt-6 flex justify-end">
          <a
            href="/ventas"
            className="px-6 py-2 bg-white border border-stone-900 font-semibold shadow-[0_3px_0_0_rgba(0,0,0,1)]"
          >
            REGRESAR
          </a>
        </div>
      </div>

      {/* Diálogo de confirmación */}
      {confirmId != null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-stone-900 rounded-xl px-8 py-6 max-w-md w-full shadow-xl">
            <h3 className="text-center font-bold mb-4">MENSAJE</h3>
            <p className="text-center mb-6">
              ¿Está seguro que desea autorizar la entrega?
            </p>
            <div className="flex justify-center gap-4">
              <button
                disabled={submitting}
                onClick={handleAutorizarEntrega}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold border border-stone-900 shadow-[0_3px_0_0_rgba(0,0,0,1)] disabled:opacity-60"
              >
                Aceptar
              </button>
              <button
                disabled={submitting}
                onClick={() => setConfirmId(null)}
                className="px-6 py-2 bg-white border border-stone-900 font-semibold shadow-[0_3px_0_0_rgba(0,0,0,1)] disabled:opacity-60"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EntregaPedidoPage;
