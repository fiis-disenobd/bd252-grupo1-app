import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTopClientesDetalle, useTopClientesResumen } from '@/features/top-clientes/hooks';

const formatNumber = (value: number, opts?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat('es-PE', opts).format(value);

const ReporteTopClientes = () => {
  const navigate = useNavigate();

  const [cliente, setCliente] = useState('');
  const [antiguedadMin, setAntiguedadMin] = useState('');
  const [refreshFlag, setRefreshFlag] = useState(0);

  const buildParams = useCallback(() => {
    const params = new URLSearchParams();
    if (cliente) params.set('cliente', cliente);
    if (antiguedadMin) params.set('antiguedadMin', antiguedadMin);
    return params;
  }, [cliente, antiguedadMin]);

  const searchParams = useMemo(() => {
    const params = buildParams();
    params.set('refresh', String(refreshFlag));
    return params;
  }, [buildParams, refreshFlag]);

  const resumen = useTopClientesResumen(searchParams);
  const detalle = useTopClientesDetalle(searchParams);
  const apiError = resumen.error || detalle.error;

  const cards = [
    { label: 'Total Clientes', value: resumen.data?.totalClientes ?? 0, icon: '📊' },
    { label: 'Clientes VIP (10+ años)', value: resumen.data?.clientesVip ?? 0, icon: '👑' },
    {
      label: 'Volumen Top 10',
      value: `${formatNumber(resumen.data?.volumenTop10Kg ?? 0)} kg`,
      icon: '📈',
    },
    {
      label: 'Descuentos Totales',
      value: `S/ ${formatNumber(resumen.data?.descuentosTotalesSoles ?? 0, { minimumFractionDigits: 2 })}`,
      icon: '💲',
    },
  ];

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-stone-300 text-stone-700 bg-white hover:bg-stone-50"
          >
            <span className="text-lg">←</span>
            <span className="text-sm font-semibold">Atrás</span>
          </button>
          <h2 className="text-3xl font-semibold text-stone-900">Top Clientes y Descuentos</h2>
        </div>
        <button className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 text-sm font-semibold">
          ⬇ Exportar Reporte
        </button>
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error al consultar el reporte: {apiError}. Verifica que el backend esté corriendo.
        </div>
      )}

      <div className="bg-white border border-stone-200 rounded-2xl shadow-card p-6 space-y-6">
        <h3 className="text-lg font-semibold text-stone-900">Filtros de Análisis</h3>
        <div className="grid gap-4 md:grid-cols-2">
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
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span className="font-semibold">Antigüedad mínima (años)</span>
            <input
              type="number"
              min={0}
              value={antiguedadMin}
              onChange={(e) => setAntiguedadMin(e.target.value)}
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

      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-stone-200 rounded-2xl shadow-card p-5 flex items-center gap-3"
          >
            <div className="text-2xl">{stat.icon}</div>
            <div>
              <p className="text-sm text-stone-500">{stat.label}</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">
                {resumen.loading && resumen.data === null ? '...' : stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200">
          <h3 className="text-lg font-semibold text-stone-900">Ranking de Top Clientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-stone-700">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-widest text-stone-500">
              <tr>
                <th className="px-4 py-3">Ranking</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">RUC</th>
                <th className="px-4 py-3">Volumen (kg)</th>
                <th className="px-4 py-3">Monto Total</th>
                <th className="px-4 py-3">Prom. Mensual</th>
                <th className="px-4 py-3">Antigüedad</th>
                <th className="px-4 py-3">% Desc. Antigüedad</th>
                <th className="px-4 py-3">Desc. Aplicados</th>
                <th className="px-4 py-3">Última Compra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {detalle.loading && (
                <tr>
                  <td colSpan={10} className="px-4 py-3 text-center text-stone-500">
                    Consultando ranking...
                  </td>
                </tr>
              )}
              {!detalle.loading &&
                detalle.rows.map((row) => (
                  <tr key={row.ranking} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-semibold text-stone-900">#{row.ranking}</td>
                    <td className="px-4 py-3">{row.cliente}</td>
                    <td className="px-4 py-3">{row.ruc}</td>
                    <td className="px-4 py-3">{formatNumber(row.volumenKg)}</td>
                    <td className="px-4 py-3">S/ {formatNumber(row.montoTotal, { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3">S/ {formatNumber(row.promMensual, { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        {row.antiguedadAnios} años
                      </span>
                    </td>
                    <td className="px-4 py-3">{row.descuentoAntiguedadPct}%</td>
                    <td className="px-4 py-3">S/ {formatNumber(row.descuentoAplicadoSoles, { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3">{row.ultimaCompra ?? '—'}</td>
                  </tr>
                ))}
              {!detalle.loading && !detalle.rows.length && (
                <tr>
                  <td colSpan={10} className="px-4 py-3 text-center text-stone-500">
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

export default ReporteTopClientes;
