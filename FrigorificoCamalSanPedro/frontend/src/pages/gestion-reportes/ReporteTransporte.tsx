import { useNavigate } from 'react-router-dom';

const stats = [
  { label: 'Total Viajes', value: '8', icon: '🚚' },
  { label: 'Tiempo Promedio', value: '1h 55m', icon: '⏱' },
  { label: 'Con Retraso', value: '4', icon: '⚠' },
  { label: '% Retrasos', value: '66.7%', icon: '📈' },
  { label: 'En Tránsito', value: '2', icon: '🚛' },
];

const viajes = [
  { fecha: '2024-01-15', pedido: '#1001', cliente: 'Carnicería El Buen Corte', distrito: 'ATE', peso: '245.5', salida: '08:30', llegada: '10:15', transito: '1h 45m', estado: 'Completado', retraso: '+15m' },
  { fecha: '2024-01-15', pedido: '#1002', cliente: 'Distribuidora San Miguel', distrito: 'ATE', peso: '185.0', salida: '09:45', llegada: '11:10', transito: '1h 25m', estado: 'Completado', retraso: 'A tiempo' },
  { fecha: '2024-01-15', pedido: '#1003', cliente: 'Mercado Central Ate', distrito: 'ATE', peso: '320.0', salida: '14:00', llegada: '16:50', transito: '2h 50m', estado: 'Completado', retraso: '+80m' },
  { fecha: '2024-01-15', pedido: '#1004', cliente: 'Carnes Premium SAC', distrito: 'ATE', peso: '195.0', salida: '16:30', llegada: '18:20', transito: '1h 50m', estado: 'Completado', retraso: '+20m' },
  { fecha: '2024-01-16', pedido: '#1005', cliente: 'Supermercados La Esquina', distrito: 'ATE', peso: '210.5', salida: '08:15', llegada: '09:40', transito: '1h 25m', estado: 'Completado', retraso: 'A tiempo' },
  { fecha: '2024-01-16', pedido: '#1006', cliente: 'Restaurante El Rincón', distrito: 'ATE', peso: '165.0', salida: '10:30', llegada: '-', transito: '-', estado: 'En tránsito', retraso: '-' },
  { fecha: '2024-01-16', pedido: '#1007', cliente: 'Pollerías Unidos', distrito: 'ATE', peso: '280.0', salida: '13:00', llegada: '15:15', transito: '2h 15m', estado: 'Completado', retraso: '+45m' },
  { fecha: '2024-01-16', pedido: '#1008', cliente: 'Minimarket La Bodega', distrito: 'ATE', peso: '125.0', salida: '15:45', llegada: '-', transito: '-', estado: 'En tránsito', retraso: '-' },
];

const ReporteTransporte = () => {
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
          <h2 className="text-3xl font-semibold text-stone-900">Transporte Lurín → Ate</h2>
        </div>
        <button className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 text-sm font-semibold">
          ↓ Exportar Reporte
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-card p-6 space-y-4">
        <h3 className="text-lg font-semibold text-stone-900">Filtros de Monitoreo</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span className="font-semibold">Fecha Inicio *</span>
            <input type="date" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/40" defaultValue="2024-01-15" />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span className="font-semibold">Fecha Fin *</span>
            <input type="date" className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/40" defaultValue="2024-01-16" />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span className="font-semibold">Sede Destino</span>
            <select className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/40">
              <option>Todos los distritos</option>
              <option>Ate</option>
            </select>
          </label>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm text-stone-700 flex-wrap">
          <div className="flex items-center gap-2 text-amber-700">
            <span className="text-lg">ℹ</span>
            <p>El tiempo de tránsito se calcula como la diferencia entre la fecha y hora de pedido y la fecha y hora de entrega registradas.</p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" className="rounded border-stone-300" />
            <span>Solo pedidos pagados</span>
          </label>
        </div>
        <button className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-[#5a2b0d]">
          Aplicar Filtros
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-stone-200 rounded-2xl shadow-card p-5 flex items-center gap-3">
            <div className="text-2xl">{stat.icon}</div>
            <div>
              <p className="text-sm text-stone-500">{stat.label}</p>
              <p className="text-2xl font-bold text-stone-900 mt-1">{stat.value}</p>
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
              {viajes.map((viaje) => (
                <tr key={viaje.pedido} className="hover:bg-stone-50">
                  <td className="px-6 py-4 font-semibold text-stone-900">{viaje.fecha}</td>
                  <td className="px-6 py-4">{viaje.pedido}</td>
                  <td className="px-6 py-4">{viaje.cliente}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                      {viaje.distrito}
                    </span>
                  </td>
                  <td className="px-6 py-4">{viaje.peso}</td>
                  <td className="px-6 py-4">{viaje.salida}</td>
                  <td className="px-6 py-4">{viaje.llegada}</td>
                  <td className="px-6 py-4">{viaje.transito}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        viaje.estado === 'En tránsito'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {viaje.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        viaje.retraso.includes('A tiempo')
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : viaje.retraso.includes('-')
                          ? 'bg-stone-100 text-stone-700 border-stone-200'
                          : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}
                    >
                      {viaje.retraso}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ReporteTransporte;
