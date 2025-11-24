import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVentasDetalle, useVentasResumen } from '@/features/ventas/hooks';

const iconBar = (
  <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M5 20V9" strokeLinecap="round" />
    <path d="M12 20V4" strokeLinecap="round" />
    <path d="M19 20V12" strokeLinecap="round" />
  </svg>
);

const ReporteVentasDia = () => {
  const navigate = useNavigate();
  const [fecha, setFecha] = useState<string>('');
  const [sede, setSede] = useState<string>('');
  const [especie, setEspecie] = useState<string>('');
  const [cliente, setCliente] = useState<string>('');

  const resumen = useVentasResumen();

  const [refreshFlag, setRefreshFlag] = useState(0);

  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    if (fecha) params.set('fecha', fecha);
    if (sede) params.set('sede', sede);
    if (especie) params.set('especie', especie);
    if (cliente) params.set('cliente', cliente);
    params.set('refresh', refreshFlag.toString());
    return params;
  }, [fecha, sede, especie, cliente, refreshFlag]);

  const detalle = useVentasDetalle(searchParams);

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-stone-300 text-stone-700 bg-white hover:bg-stone-50"
          >
            <span className="text-lg">←</span>
            <span className="text-sm font-semibold">Atrás</span>
          </button>
          <h2 className="text-3xl font-semibold text-stone-900">Reporte de Ventas del Día</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 text-sm font-semibold">
            ↓ CSV
          </button>
          <button className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 text-sm font-semibold">
            ↓ PDF
          </button>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-card p-6 space-y-6">
        <h3 className="text-lg font-semibold text-stone-900">Filtros de Búsqueda</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span className="font-semibold">Fecha</span>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="dd/mm/aaaa"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span className="font-semibold">Sede</span>
            <select
              value={sede}
              onChange={(e) => setSede(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Seleccionar sede</option>
              <option value="LURIN">Lurín</option>
              <option value="ATE">Ate</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span className="font-semibold">Especie</span>
            <select
              value={especie}
              onChange={(e) => setEspecie(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Seleccionar especie</option>
              <option value="VACUNO">VACUNO</option>
              <option value="OVINO">OVINO</option>
              <option value="PORCINO">PORCINO</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span className="font-semibold">Cliente</span>
            <input
              type="text"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Buscar cliente"
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
        </div>
        <button
          onClick={() => setRefreshFlag((v) => v + 1)}
          className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-[#5a2b0d]"
        >
          Aplicar Filtros
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white border border-stone-200 rounded-2xl shadow-card p-5 flex items-center gap-4">
          <div className="flex-shrink-0">{iconBar}</div>
          <div>
            <p className="text-sm text-stone-600">Total Ventas</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">
              {resumen.loading ? 'Cargando...' : `S/ ${resumen.data?.totalVentas?.toLocaleString('es-PE') ?? '0'}`}
            </p>
            <p className="text-xs text-stone-500 mt-1">Ventas netas</p>
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl shadow-card p-5 flex items-center gap-4">
          <div className="flex-shrink-0">{iconBar}</div>
          <div>
            <p className="text-sm text-stone-600">Total Kilogramos</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">
              {resumen.loading ? 'Cargando...' : `${resumen.data?.totalKilogramos ?? 0} kg`}
            </p>
            <p className="text-xs text-stone-500 mt-1">Volumen liquidado</p>
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl shadow-card p-5 flex items-center gap-4">
          <div className="flex-shrink-0">{iconBar}</div>
          <div>
            <p className="text-sm text-stone-600">Precio Promedio/kg</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">
              {resumen.loading ? 'Cargando...' : `S/ ${resumen.data?.precioPromedioKg ?? 0}`}
            </p>
            <p className="text-xs text-stone-500 mt-1">Ticket promedio</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200">
          <h3 className="text-lg font-semibold text-stone-900">Detalle de Ventas del Día</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-stone-700">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-widest text-stone-500">
              <tr>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Especie</th>
                <th className="px-6 py-3">Kilogramos</th>
                <th className="px-6 py-3">Precio/kg</th>
                <th className="px-6 py-3">Descuento (%)</th>
                <th className="px-6 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {detalle.loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-stone-500">
                    Consultando ventas...
                  </td>
                </tr>
              )}
              {!detalle.loading &&
                detalle.rows.map((venta) => (
                  <tr key={`${venta.cliente}-${venta.especie}`} className="hover:bg-stone-50">
                    <td className="px-6 py-4 font-semibold text-stone-900">{venta.cliente}</td>
                    <td className="px-6 py-4">{venta.especie}</td>
                    <td className="px-6 py-4">{venta.kilogramos}</td>
                    <td className="px-6 py-4">S/ {venta.precioKg.toFixed(2)}</td>
                    <td className="px-6 py-4">{venta.descuentoPorcentaje}%</td>
                    <td className="px-6 py-4 font-semibold">S/ {venta.total.toFixed(2)}</td>
                  </tr>
                ))}
              {!detalle.loading && !detalle.rows.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-stone-500">
                    No hay resultados con los filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ReporteVentasDia;
