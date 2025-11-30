const reclamos = [
  { codigo: 'R-0892', tipo: 'Calidad', estado: 'En análisis', fecha: '06/02/2025' },
  { codigo: 'R-0893', tipo: 'Logística', estado: 'Resuelto', fecha: '05/02/2025' },
  { codigo: 'R-0894', tipo: 'Facturación', estado: 'Abierto', fecha: '05/02/2025' },
];

const Reclamos = () => (
  <section className="space-y-6">
    <div>
      <h2 className="text-3xl font-semibold text-stone-900">Gestión de Reclamos</h2>
      <p className="text-stone-600 mt-2">Monitorea tiempos de atención y categorías de reclamos.</p>
    </div>
    <div className="bg-white rounded-2xl border border-stone-100 shadow-card">
      <div className="grid grid-cols-4 text-xs uppercase tracking-widest text-stone-500 border-b border-stone-100">
        <span className="px-4 py-3">Código</span>
        <span className="px-4 py-3">Tipo</span>
        <span className="px-4 py-3">Estado</span>
        <span className="px-4 py-3">Fecha</span>
      </div>
      {reclamos.map((reclamo) => (
        <div key={reclamo.codigo} className="grid grid-cols-4 text-sm text-stone-700 border-b border-stone-100 last:border-b-0">
          <span className="px-4 py-4 font-semibold text-stone-900">{reclamo.codigo}</span>
          <span className="px-4 py-4">{reclamo.tipo}</span>
          <span className="px-4 py-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                reclamo.estado === 'Resuelto'
                  ? 'bg-emerald-100 text-emerald-800'
                  : reclamo.estado === 'En análisis'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-stone-200 text-stone-700'
              }`}
            >
              {reclamo.estado}
            </span>
          </span>
          <span className="px-4 py-4">{reclamo.fecha}</span>
        </div>
      ))}
    </div>
  </section>
);

export default Reclamos;
