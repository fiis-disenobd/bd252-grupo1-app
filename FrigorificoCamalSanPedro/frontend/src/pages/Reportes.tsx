import { useNavigate } from 'react-router-dom';

type ReportCard = {
  title: string;
  description: string;
  path?: string;
};

const reportCards: ReportCard[] = [
  {
    title: 'Ventas del día',
    description: 'Visualizar ventas diarias por especie/cliente/sede',
    path: '/reportes/ventas-dia',
  },
  {
    title: 'Stock, Ocupación e ingresos',
    description: 'Monitoreo de stock, cámaras y recepción de ganado',
    path: '/reportes/stock-ocupacion',
  },
  {
    title: 'Trazabilidad de pieza',
    description: 'Consultar cadena completa de trazabilidad',
    path: '/reportes/trazabilidad',
  },
  {
    title: 'Transporte',
    description: 'Monitoreo de flujo Lurín → Ate',
    path: '/reportes/transporte',
  },
  {
    title: 'Top clientes y descuentos',
    description: 'Ranking de clientes y descuentos por antigüedad',
    path: '/reportes/top-clientes',
  },
  {
    title: 'Programación y distribución automática',
    description: 'Automatización de reportes programados',
    path: '/reportes/programacion',
  },
];

const Reportes = () => {
  const navigate = useNavigate();
  const handleNavigate = (path?: string) => {
    if (!path) return;
    navigate(path);
  };

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm text-stone-500 uppercase tracking-[0.3em]">Gestión de reportes</p>
        <h2 className="text-3xl font-semibold text-stone-900 mt-2">Bienvenido al módulo gestión de reportes.</h2>
        <p className="text-stone-600 mt-2 max-w-3xl">
          Selecciona la vista que necesites para analizar ventas, stock, trazabilidad y transporte del ganado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reportCards.map((card) => (
          <article
            key={card.title}
            className="bg-white border border-stone-100 rounded-[1.25rem] shadow-card p-6 flex flex-col gap-6"
          >
            <div>
              <h3 className="text-xl font-semibold text-stone-900">{card.title}</h3>
              <p className="text-sm text-stone-600 mt-2">{card.description}</p>
            </div>
            <button
              onClick={() => handleNavigate(card.path)}
              className={`bg-primary text-white font-semibold tracking-wide py-3 rounded-lg shadow-sm transition-colors w-full ${
                card.path ? 'hover:bg-[#5a2b0d]' : 'opacity-60 cursor-not-allowed'
              }`}
              disabled={!card.path}
            >
              Acceder
            </button>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Reportes;
