import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface VentaResumen {
  id_venta: number;
  cod_venta: string;
  fecha: string; // ISO
  hora: string;  // HH:mm
  dni: string;
  nombre: string;
  monto: number;
}

const HistorialVentasPage: React.FC = () => {
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroDni, setFiltroDni] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [ventas, setVentas] = useState<VentaResumen[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const cargarVentas = async () => {
    setLoading(true);
    try {
      // TODO: ajusta la URL a tu endpoint real
      const params = new URLSearchParams();
      if (filtroNombre.trim()) params.append("nombre", filtroNombre.trim());
      if (filtroDni.trim()) params.append("dni", filtroDni.trim());
      if (filtroFecha.trim()) params.append("fecha", filtroFecha.trim());

      const qs = params.toString();
      const url = qs
        ? `http://localhost:3001/cierre-ventas/historial?${qs}`
        : "http://localhost:3001/cierre-ventas/historial";

      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        setVentas(data);
      } else {
        console.error("Error al cargar historial");
      }
    } catch (err) {
      console.error("Error de conexión", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVentas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    cargarVentas();
  };

  return (
    <section className="h-full flex flex-col bg-stone-50">
      {/* Encabezado */}
      <div className="w-full bg-amber-800 text-white px-8 py-3 shadow">
        <h1 className="text-xl font-semibold tracking-wide">
          CIERRE DE VENTAS – HISTORIAL DE VENTAS
        </h1>
      </div>

      <div className="flex-1 px-6 py-6 flex flex-col gap-6">
        {/* Barra de búsqueda */}
        <form
          onSubmit={handleBuscar}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              BUSCAR POR NOMBRE
            </label>
            <input
              className="w-full border border-stone-400 px-3 py-1 rounded-sm"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              BUSCAR POR DNI
            </label>
            <input
              className="w-full border border-stone-400 px-3 py-1 rounded-sm"
              value={filtroDni}
              onChange={(e) => setFiltroDni(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              BUSCAR POR FECHA
            </label>
            <input
              type="date"
              className="w-full border border-stone-400 px-3 py-1 rounded-sm"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
            />
          </div>

          <div className="flex md:justify-start">
            <button
              type="submit"
              className="mt-4 md:mt-0 px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold
                         border border-stone-900 shadow-[0_3px_0_0_rgba(0,0,0,1)]"
            >
              BUSCAR
            </button>
          </div>
        </form>

        {/* Tabla de historial */}
        <div className="flex-1 flex flex-col">
          <h2 className="font-semibold mb-2 text-stone-800">HISTORIAL</h2>

          <div className="border border-stone-800 bg-white overflow-auto">
            {loading ? (
              <div className="p-4 text-center text-stone-600">Cargando...</div>
            ) : ventas.length === 0 ? (
              <div className="p-4 text-center text-stone-600">
                No se encontraron ventas para el criterio indicado.
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-stone-200 border-b border-stone-800">
                  <tr>
                    <th className="px-3 py-2 border-r border-stone-400">
                      cod_venta
                    </th>
                    <th className="px-3 py-2 border-r border-stone-400">
                      fecha
                    </th>
                    <th className="px-3 py-2 border-r border-stone-400">
                      hora
                    </th>
                    <th className="px-3 py-2 border-r border-stone-400">
                      dni
                    </th>
                    <th className="px-3 py-2 border-r border-stone-400">
                      nombre
                    </th>
                    <th className="px-3 py-2 border-r border-stone-400">
                      monto
                    </th>
                    <th className="px-3 py-2">acción</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((v) => (
                    <tr
                      key={v.id_venta}
                      className="border-t border-stone-300"
                    >
                      <td className="px-3 py-2 border-r border-stone-300">
                        {v.cod_venta}
                      </td>
                      <td className="px-3 py-2 border-r border-stone-300">
                        {v.fecha}
                      </td>
                      <td className="px-3 py-2 border-r border-stone-300">
                        {v.hora}
                      </td>
                      <td className="px-3 py-2 border-r border-stone-300">
                        {v.dni}
                      </td>
                      <td className="px-3 py-2 border-r border-stone-300">
                        {v.nombre}
                      </td>
                      <td className="px-3 py-2 border-r border-stone-300">
                        S/ {v.monto.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          className="px-3 py-1 text-xs bg-white border border-stone-900 font-semibold
                                     shadow-[0_2px_0_0_rgba(0,0,0,1)]"
                          onClick={() =>
                            navigate(`/ventas/historial/${v.id_venta}`)
                          }
                        >
                          detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => navigate("/ventas")}
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

export default HistorialVentasPage;
