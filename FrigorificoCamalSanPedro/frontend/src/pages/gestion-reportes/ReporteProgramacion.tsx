import { useNavigate } from 'react-router-dom';

const resumen = [
  { label: 'Programaciones Activas', value: '12', icon: '📅' },
  { label: 'Ejecuciones Hoy', value: '8', icon: '▶️' },
  { label: 'Éxitos (30 días)', value: '456', icon: '📧' },
  { label: 'Tasa de Éxito', value: '97.4%', icon: '⬇' },
];

const programaciones = [
  {
    nombre: 'Reporte Diario de Ventas',
    reporte: 'Ventas del día',
    frecuencia: 'Diario',
    hora: '06:00',
    destinatarios: '2 destinatario(s)',
    ultima: '2024-01-16 06:00',
    proxima: '2024-01-17 06:00',
    estado: 'Activo',
    exitos: '245/2',
  },
  {
    nombre: 'Stock Semanal - Cámaras',
    reporte: 'Stock y Ocupación',
    frecuencia: 'Semanal (Lunes)',
    hora: '08:00',
    destinatarios: '2 destinatario(s)',
    ultima: '2024-01-15 08:00',
    proxima: '2024-01-22 08:00',
    estado: 'Activo',
    exitos: '52/0',
  },
  {
    nombre: 'Decomisos Mensual',
    reporte: 'Decomisos y Observaciones',
    frecuencia: 'Mensual (día 1)',
    hora: '09:30',
    destinatarios: '2 destinatario(s)',
    ultima: '2024-01-01 09:30',
    proxima: '2024-02-01 09:30',
    estado: 'Activo',
    exitos: '12/1',
  },
  {
    nombre: 'Latencia de Guías - Urgente',
    reporte: 'Latencia de Guías',
    frecuencia: 'Diario',
    hora: '17:00',
    destinatarios: '1 destinatario(s)',
    ultima: '2024-01-16 17:00',
    proxima: '2024-01-17 17:00',
    estado: 'Pausado',
    exitos: '180/5',
  },
];

const ejecuciones = [
  {
    fecha: '2024-01-16 17:00',
    programacion: 'Latencia de Guías - Urgente',
    estado: 'Exitoso',
    destinatarios: 1,
    tamano: '245 KB',
    tiempo: '2.3s',
    obs: '',
  },
  {
    fecha: '2024-01-16 06:00',
    programacion: 'Reporte Diario de Ventas',
    estado: 'Exitoso',
    destinatarios: 2,
    tamano: '1.2 MB',
    tiempo: '5.7s',
    obs: '',
  },
  {
    fecha: '2024-01-15 08:00',
    programacion: 'Stock Semanal - Cámaras',
    estado: 'Exitoso',
    destinatarios: 2,
    tamano: '890 KB',
    tiempo: '3.1s',
    obs: '',
  },
  {
    fecha: '2024-01-15 17:00',
    programacion: 'Latencia de Guías - Urgente',
    estado: 'Fallido',
    destinatarios: 0,
    tamano: '-',
    tiempo: '-',
    obs: 'Error de conexión SMTP',
  },
];

const ReporteProgramacion = () => {
  const navigate = useNavigate();

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
        <button className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 text-sm font-semibold">
          + Nueva Programación
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {resumen.map((item) => (
          <div key={item.label} className="bg-white border border-stone-200 rounded-2xl shadow-card p-5 flex items-center gap-3">
            <div className="text-2xl">{item.icon}</div>
            <div>
              <p className="text-sm text-stone-500">{item.label}</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{item.value}</p>
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
                <th className="px-5 py-3">Hora</th>
                <th className="px-5 py-3">Destinatarios</th>
                <th className="px-5 py-3">Última Ejecución</th>
                <th className="px-5 py-3">Próxima Ejecución</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Éxito/fallos</th>
                <th className="px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {programaciones.map((prog) => (
                <tr key={prog.nombre} className="hover:bg-stone-50">
                  <td className="px-5 py-4 font-semibold text-stone-900">{prog.nombre}</td>
                  <td className="px-5 py-4">{prog.reporte}</td>
                  <td className="px-5 py-4">{prog.frecuencia}</td>
                  <td className="px-5 py-4">{prog.hora}</td>
                  <td className="px-5 py-4">{prog.destinatarios}</td>
                  <td className="px-5 py-4">{prog.ultima}</td>
                  <td className="px-5 py-4">{prog.proxima}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        prog.estado === 'Activo'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-stone-800 text-white border-stone-800'
                      }`}
                    >
                      {prog.estado}
                    </span>
                  </td>
                  <td className="px-5 py-4">{prog.exitos}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-xs text-stone-600">
                      <button className="px-2 py-1 rounded bg-white border border-stone-200 hover:bg-stone-50">▶</button>
                      <button className="px-2 py-1 rounded bg-white border border-stone-200 hover:bg-stone-50">⏸</button>
                      <button className="px-2 py-1 rounded bg-white border border-stone-200 hover:bg-stone-50">📧</button>
                      <button className="px-2 py-1 rounded bg-white border border-stone-200 hover:bg-stone-50">✎</button>
                      <button className="px-2 py-1 rounded bg-white border border-stone-200 hover:bg-stone-50">🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
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
                <th className="px-5 py-3">Fecha y Hora</th>
                <th className="px-5 py-3">Programación</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Destinatarios</th>
                <th className="px-5 py-3">Tamaño</th>
                <th className="px-5 py-3">Tiempo Ejecución</th>
                <th className="px-5 py-3">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {ejecuciones.map((ej) => (
                <tr key={ej.fecha} className="hover:bg-stone-50">
                  <td className="px-5 py-4 font-semibold text-stone-900">{ej.fecha}</td>
                  <td className="px-5 py-4">{ej.programacion}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        ej.estado === 'Exitoso'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}
                    >
                      {ej.estado}
                    </span>
                  </td>
                  <td className="px-5 py-4">{ej.destinatarios}</td>
                  <td className="px-5 py-4">{ej.tamano}</td>
                  <td className="px-5 py-4">{ej.tiempo}</td>
                  <td className="px-5 py-4 text-rose-700">{ej.obs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ReporteProgramacion;
