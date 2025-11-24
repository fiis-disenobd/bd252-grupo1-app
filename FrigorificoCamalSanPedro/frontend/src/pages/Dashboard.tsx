import { useHealthStatus, useReportSummary } from '@/features/reportes/hooks';

const quickActions = [
  { label: 'Registrar cliente', description: 'Alta rápida de clientes' },
  { label: 'Ingresar producto', description: 'Carga de nuevos productos' },
  { label: 'Generar reporte', description: 'Programar informe ejecutivo' },
];

const Dashboard = () => {
  const health = useHealthStatus();
  const { summary } = useReportSummary();

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-stone-900">Bienvenido al Sistema de Ventas – Camal San Pedro</h2>
          <p className="text-stone-600 mt-2 max-w-3xl">
            Consulta el estado de los módulos de clientes, productos, ventas y reportes en tiempo real.
          </p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            health === 'ok'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          Servidor {health === 'ok' ? 'operativo' : 'sin conexión'}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <div key={item.id} className="bg-white border border-stone-100 rounded-2xl p-5 shadow-card">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-900">{item.title}</p>
            <p className="text-2xl font-bold mt-2">{item.value}</p>
            <p className="text-sm text-stone-500 mt-1">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action) => (
          <div key={action.label} className="bg-white border border-stone-100 rounded-xl p-5">
            <p className="text-sm font-semibold text-stone-900">{action.label}</p>
            <p className="text-xs text-stone-500 mt-2">{action.description}</p>
            <button className="mt-4 text-primary font-semibold text-sm">Ir al módulo →</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Dashboard;
