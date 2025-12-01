import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgramacionResumen, useProgramaciones, useEjecucionesProgramacion } from '@/features/programacion/hooks';

const formatDateTime = (value: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toISOString().slice(0, 10)} ${date.toISOString().slice(11, 16)}`;
};

const ReporteProgramacion = () => {
  const navigate = useNavigate();
  const [refreshFlag, setRefreshFlag] = useState(0);

  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set('refresh', String(refreshFlag));
    return params;
  }, [refreshFlag]);

  const resumen = useProgramacionResumen(searchParams);
  const programaciones = useProgramaciones(searchParams);
  const ejecuciones = useEjecucionesProgramacion(searchParams);

  const apiError = resumen.error || programaciones.error || ejecuciones.error;

  const cards = [
    { label: 'Programaciones Activas', value: resumen.data?.totalProgramacionesActivas ?? 0, icon: '📅' },
    { label: 'Ejecuciones Hoy', value: resumen.data?.totalEjecucionesHoy ?? 0, icon: '▶️' },
    { label: 'Éxitos (30 días)', value: resumen.data?.exitos30d ?? 0, icon: '📂' },
    {
      label: 'Tasa de Éxito',
      value:
        resumen.data?.tasaExito30d === null || resumen.data?.tasaExito30d === undefined
          ? '—'
          : `${resumen.data.tasaExito30d.toFixed(1)}%`,
      icon: '↗️',
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
          <h2 className="text-3xl font-semibold text-stone-900">Programación y Distribución Automática</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 text-sm font-semibold">
            + Nueva Programación
          </button>
          <button
            onClick={() => setRefreshFlag((v) => v + 1)}
            className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 text-sm font-semibold"
          >
            ↻ Actualizar
          </button>
        </div>
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error al consultar el reporte: {apiError}. Verifica que el backend esté corriendo.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        {cards.map((item) => (
          <div
            key={item.label}
            className="bg-white border border-stone-200 rounded-2xl shadow-card p-5 flex items-center gap-3"
          >
            <div className="text-2xl">{item.icon}</div>
            <div>
              <p className="text-sm text-stone-500">{item.label}</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">
                {resumen.loading && resumen.data === null ? '...' : item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200">
          <h3 className="text-lg font-semibold text-stone-900">Programaciones Configuradas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-stone-700">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-widest text-stone-500">
              <tr>
                <th className="px-5 py-3">Nombre</th>
                <th className="px-5 py-3">Reporte</th>
                <th className="px-5 py-3">Frecuencia</th>
                <th className="px-5 py-3">Hora ref.</th>
                <th className="px-5 py-3">Última Ejecución</th>
                <th className="px-5 py-3">Próxima Ejecución</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Éxito/fallos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {programaciones.loading && (
                <tr>
                  <td colSpan={8} className="px-5 py-4 text-center text-stone-500">
                    Cargando programaciones...
                  </td>
                </tr>
              )}
              {!programaciones.loading &&
                programaciones.rows.map((prog) => {
                  const esVigente = !prog.vigenteHasta || new Date(prog.vigenteHasta) >= new Date();
                  const estadoLabel = esVigente ? 'Activo' : 'Vencido';
                  return (
                    <tr key={prog.programacionId} className="hover:bg-stone-50">
                      <td className="px-5 py-4 font-semibold text-stone-900">{prog.nombre}</td>
                      <td className="px-5 py-4">{prog.reporteId ?? '—'}</td>
                      <td className="px-5 py-4 truncate max-w-[200px]">{prog.expresion ?? '—'}</td>
                      <td className="px-5 py-4">{prog.horaReferencia ?? '—'}</td>
                      <td className="px-5 py-4">{formatDateTime(prog.ultimaEjecucion)}</td>
                      <td className="px-5 py-4">{formatDateTime(prog.proximaEjecucion)}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            esVigente
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-stone-800 text-white border-stone-800'
                          }`}
                        >
                          {estadoLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {prog.exitos}/{prog.fallos}
                      </td>
                    </tr>
                  );
                })}
              {!programaciones.loading && !programaciones.rows.length && (
                <tr>
                  <td colSpan={8} className="px-5 py-4 text-center text-stone-500">
                    No hay programaciones vigentes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200">
          <h3 className="text-lg font-semibold text-stone-900">Historial de Ejecuciones Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-stone-700">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-widest text-stone-500">
              <tr>
                <th className="px-5 py-3">Fecha Programada</th>
                <th className="px-5 py-3">Inicio</th>
                <th className="px-5 py-3">Fin</th>
                <th className="px-5 py-3">Programación</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Mensaje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {ejecuciones.loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-4 text-center text-stone-500">
                    Cargando ejecuciones...
                  </td>
                </tr>
              )}
              {!ejecuciones.loading &&
                ejecuciones.rows.map((ej) => {
                  const esExito = (ej.estado || '').toUpperCase() === 'EXITOSA';
                  return (
                    <tr key={ej.ejecucionId} className="hover:bg-stone-50">
                      <td className="px-5 py-4 font-semibold text-stone-900">{formatDateTime(ej.fechaProgramada)}</td>
                      <td className="px-5 py-4">{formatDateTime(ej.inicio)}</td>
                      <td className="px-5 py-4">{formatDateTime(ej.fin)}</td>
                      <td className="px-5 py-4">{ej.programacionId ?? '—'}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            esExito
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}
                        >
                          {ej.estado ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">{ej.mensajeEstado ?? '—'}</td>
                    </tr>
                  );
                })}
              {!ejecuciones.loading && !ejecuciones.rows.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-4 text-center text-stone-500">
                    No hay ejecuciones registradas.
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

export default ReporteProgramacion;
