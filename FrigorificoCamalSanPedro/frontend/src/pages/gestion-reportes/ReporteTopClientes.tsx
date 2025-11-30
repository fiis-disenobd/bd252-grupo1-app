import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Total Clientes", value: "156", icon: "📊" },
  { label: "Clientes VIP (10+ años)", value: "45", icon: "👑" },
  { label: "Volumen Top 10", value: "95,420 kg", icon: "📈" },
  { label: "Descuentos Totales", value: "S/ 168.420", icon: "💲" },
];

const ranking = [
  {
    ranking: "#1",
    cliente: "Carnicería El Buen Corte",
    ruc: "20123456789",
    volumen: "15,420",
    monto: "S/ 285,780",
    promedio: "S/ 23,815",
    antiguedad: "12 años - VIP",
    descAntiguedad: "8.5%",
    descAplicados: "S/ 24,290",
    margen: "18.2%",
    ultimaCompra: "2024-01-16",
  },
  {
    ranking: "#2",
    cliente: "Supermercados La Plaza S.A.C.",
    ruc: "20234567890",
    volumen: "12,850",
    monto: "S/ 225,650",
    promedio: "S/ 18,804",
    antiguedad: "8 años",
    descAntiguedad: "N/A",
    descAplicados: "S/ 11,282",
    margen: "15.8%",
    ultimaCompra: "2024-01-16",
  },
  {
    ranking: "#3",
    cliente: "Distribuidora Norte EIRL",
    ruc: "20345678901",
    volumen: "11,200",
    monto: "S/ 198,400",
    promedio: "S/ 16,533",
    antiguedad: "15 años",
    descAntiguedad: "12%",
    descAplicados: "S/ 23,808",
    margen: "16.5%",
    ultimaCompra: "2024-01-16",
  },
  {
    ranking: "#4",
    cliente: "Restaurante Los Sabores",
    ruc: "20456789012",
    volumen: "8,900",
    monto: "S/ 156,600",
    promedio: "S/ 13,050",
    antiguedad: "13 años",
    descAntiguedad: "N/A",
    descAplicados: "S/ 7,830",
    margen: "19.1%",
    ultimaCompra: "2024-01-16",
  },
  {
    ranking: "#5",
    cliente: "Mercado Central - Puesto 45",
    ruc: "20567890123",
    volumen: "7,650",
    monto: "S/ 134,775",
    promedio: "S/ 11,231",
    antiguedad: "20 años - Premium",
    descAntiguedad: "15%",
    descAplicados: "S/ 20,216",
    margen: "17.3%",
    ultimaCompra: "2024-01-15",
  },
];

const ReporteTopClientes = () => {
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
          <h2 className="text-3xl font-semibold text-stone-900">Top Clientes y Descuentos</h2>
        </div>
        <button className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 text-sm font-semibold">
          ↓ Exportar Reporte
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-card p-6 space-y-6">
        <h3 className="text-lg font-semibold text-stone-900">Filtros de Análisis</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span className="font-semibold">Periodo</span>
            <select className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/40">
              <option>Seleccionar periodo</option>
              <option>Último mes</option>
              <option>Último trimestre</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span className="font-semibold">Cliente</span>
            <input
              type="text"
              placeholder="Buscar cliente"
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span className="font-semibold">Antigüedad Mínima (años)</span>
            <input
              type="number"
              min={0}
              defaultValue={10}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
        </div>
        <button className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-[#5a2b0d]">
          Aplicar Filtros
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
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
                <th className="px-4 py-3">Desc. Antigüedad</th>
                <th className="px-4 py-3">Desc. Aplicados</th>
                <th className="px-4 py-3">Margen %</th>
                <th className="px-4 py-3">Última Compra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {ranking.map((item) => (
                <tr key={item.ranking} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-semibold text-stone-900">{item.ranking}</td>
                  <td className="px-4 py-3">{item.cliente}</td>
                  <td className="px-4 py-3">{item.ruc}</td>
                  <td className="px-4 py-3">{item.volumen}</td>
                  <td className="px-4 py-3">{item.monto}</td>
                  <td className="px-4 py-3">{item.promedio}</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                      {item.antiguedad}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.descAntiguedad}</td>
                  <td className="px-4 py-3">{item.descAplicados}</td>
                  <td className="px-4 py-3">{item.margen}</td>
                  <td className="px-4 py-3">{item.ultimaCompra}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ReporteTopClientes;
