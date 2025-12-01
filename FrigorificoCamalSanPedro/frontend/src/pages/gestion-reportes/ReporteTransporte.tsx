import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransporteDetalle, useTransporteResumen } from '@/features/transporte/hooks';

const formatMinutes = (minutes: number | null | undefined) => {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes)) return '-';
  const total = Math.round(minutes);
  const hours = Math.floor(Math.abs(total) / 60);
  const mins = Math.abs(total) % 60;
  const sign = total < 0 ? '-' : '';
  if (hours === 0) return `${sign}${mins}m`;
  return `${sign}${hours}h ${mins}m`;
};

const formatDuracion = (minutes: number | null | undefined, fallback: string | null) => {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes)) return fallback ?? '-';
  return formatMinutes(minutes);
};

const formatRetraso = (retrasoMinutos: number) => {
  if (!retrasoMinutos || retrasoMinutos <= 0) return 'A tiempo';
  return `+${retrasoMinutos}m`;
};

const ReporteTransporte = () => {
  const navigate = useNavigate();

  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [distrito, setDistrito] = useState('');
  const [soloPagados, setSoloPagados] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(0);

  const buildParams = useCallback(() => {
    const params = new URLSearchParams();
    if (fechaInicio) params.set('fechaInicio', fechaInicio);
    if (fechaFin) params.set('fechaFin', fechaFin);
    if (distrito) params.set('distrito', distrito);
    if (soloPagados) params.set('soloPagados', 'true');
    return params;
  }, [fechaInicio, fechaFin, distrito, soloPagados]);

  const searchParams = useMemo(() => {
    const params = buildParams();
    params.set('refresh', String(refreshFlag));
    return params;
  }, [buildParams, refreshFlag]);

  const resumen = useTransporteResumen(searchParams);
  const detalle = useTransporteDetalle(searchParams);
  const apiError = resumen.error || detalle.error;

  const cards = [
    { label: 'Total Viajes', value: resumen.data?.totalViajes ?? 0, icon: '🚚' },
    { label: 'Tiempo Promedio', value: formatMinutes(resumen.data?.tiempoPromedioMin), icon: '⏱️' },
    { label: 'Con Retraso', value: resumen.data?.conRetraso ?? 0, icon: '⚠️' },
    {
      label: '% Retrasos',
      value:
        resumen.data?.porcentajeRetrasos === undefined
          ? '-'
          : `${Number(resumen.data?.porcentajeRetrasos ?? 0).toFixed(1)}%`,
      icon: '📈',
    },
    { label: 'En Tránsito', value: resumen.data?.enTransito ?? 0, icon: '🚛' },
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
          <h2 className="text-3xl font-semibold text-stone-900">Transporte Lurín → Ate</h2>
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

      <div className="bg-white border border-stone-200 rounded-2xl shadow-card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-stone-900">Filtros de Monitoreo</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span className="font-semibold">Fecha Inicio *</span>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span className="font-semibold">Fecha Fin *</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span className="font-semibold">Sede Destino</span>
            <select
              value={distrito}
              onChange={(e) => setDistrito(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Todos los distritos</option>
              <option value="ATE">Ate</option>
              <option value="LURIN">Lurín</option>
            </select>
          </label>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm text-stone-700 flex-wrap">
          <div className="flex items-center gap-2 text-amber-700">
            <span className="text-lg">ℹ</span>
            <p>
              El tiempo de tránsito se calcula como la diferencia entre la fecha y hora de pedido y la fecha y hora de
              entrega registradas.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={soloPagados}
              onChange={(e) => setSoloPagados(e.target.checked)}
              className="rounded border-stone-300"
            />
            <span>Solo pedidos pagados</span>
          </label>
        </div>
        <button
          onClick={() => setRefreshFlag((v) => v + 1)}
          className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-[#5a2b0d]"
        >
          Aplicar Filtros
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
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
          <h3 className="text-lg font-semibold text-stone-900">Detalle de Viajes Lurín → Ate</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-stone-700">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-widest text-stone-500">
              <tr>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Id Pedido</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Distrito</th>
                <th className="px-6 py-3">Peso (kg)</th>
                <th className="px-6 py-3">Salida</th>
                <th className="px-6 py-3">Llegada</th>
                <th className="px-6 py-3">Tiempo Tránsito</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Retraso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {detalle.loading && (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-stone-500">
                    Consultando viajes...
                  </td>
                </tr>
              )}
              {!detalle.loading &&
                detalle.rows.map((viaje) => {
                  const isEnTransito = (viaje.estadoEntrega || '').toUpperCase() === 'PENDIENTE';
                  const retrasoLabel = formatRetraso(viaje.retrasoMinutos);
                  const duracionLabel = formatDuracion(viaje.minutos, viaje.duracion);
                  return (
                    <tr key={`${viaje.fecha}-${viaje.idPedido}`} className="hover:bg-stone-50">
                      <td className="px-6 py-4 font-semibold text-stone-900">{viaje.fecha}</td>
                      <td className="px-6 py-4">#{viaje.idPedido}</td>
                      <td className="px-6 py-4">{viaje.cliente}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                          {viaje.distrito || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">{viaje.pesoKg}</td>
                      <td className="px-6 py-4">{viaje.salida ?? '-'}</td>
                      <td className="px-6 py-4">{viaje.llegada ?? '-'}</td>
                      <td className="px-6 py-4">{duracionLabel}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            isEnTransito
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                        >
                          {isEnTransito ? 'En tránsito' : viaje.estadoEntrega || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            retrasoLabel === 'A tiempo'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}
                        >
                          {retrasoLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              {!detalle.loading && !detalle.rows.length && (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-stone-500">
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

export default ReporteTransporte;
