import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStockActual } from '@/features/stock/hooks';

const ReporteStockOcupacion = () => {
  const navigate = useNavigate();
  const [camara, setCamara] = useState('');
  const [especie, setEspecie] = useState('');

  const filters = useMemo(() => ({ camara, especie }), [camara, especie]);
  const { rows, loading } = useStockActual(filters);

  const handleExport = () => {
    const header = ['Camara', 'Especie', 'Piezas', 'Kilogramos', 'Estado'];
    const lines = rows.map((r) =>
      [
        r.camara,
        r.especie,
        r.piezas,
        r.kilogramos.toString(),
        r.estado
      ]
        .map((v) => `"${(`${v ?? ''}`).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stock-actual.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

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
          <h2 className="text-3xl font-semibold text-stone-900">Stock</h2>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 text-sm font-semibold"
        >
          ↓ Exportar
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-stone-700 font-semibold">
          <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
            <path d="M9 10h6" strokeLinecap="round" />
          </svg>
          <span>Filtros de Stock</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-stone-700">
            <span className="font-semibold">Cámara</span>
            <select
              value={camara}
              onChange={(e) => setCamara(e.target.value)}
              className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Seleccionar cámara</option>
              <option value="1">Cámara 1</option>
              <option value="2">Cámara 2</option>
              <option value="3">Cámara 3</option>
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
        </div>
        <button className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-[#5a2b0d]">
          Aplicar Filtros
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200">
          <h3 className="text-lg font-semibold text-stone-900">Inventario Actual</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-stone-700">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-widest text-stone-500">
              <tr>
                <th className="px-6 py-3">Cámara</th>
                <th className="px-6 py-3">Especie</th>
                <th className="px-6 py-3">Piezas</th>
                <th className="px-6 py-3">Kilogramos</th>
                <th className="px-6 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading && (
                <tr>
                  <td className="px-6 py-4 text-center text-stone-500" colSpan={5}>
                    Cargando inventario...
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((item) => (
                  <tr key={`${item.camara}-${item.especie}`} className="hover:bg-stone-50">
                    <td className="px-6 py-4 font-semibold text-stone-900">{item.camara}</td>
                    <td className="px-6 py-4">{item.especie}</td>
                    <td className="px-6 py-4">{item.piezas}</td>
                    <td className="px-6 py-4">{item.kilogramos.toLocaleString('es-PE')} kg</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                        {item.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td className="px-6 py-4 text-center text-stone-500" colSpan={5}>
                    No hay datos para los filtros seleccionados.
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

export default ReporteStockOcupacion;
