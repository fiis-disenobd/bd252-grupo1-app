const customers = [
  { nombre: 'Distribuciones Lima', categoria: 'Mayorista', estado: 'Activo', alta: '12/01/2024' },
  { nombre: 'Carnes del Sur', categoria: 'Retail', estado: 'Activo', alta: '03/05/2024' },
  { nombre: 'Embutidos Rivera', categoria: 'Industrial', estado: 'Suspendido', alta: '19/09/2024' },
];

const Clientes = () => (
  <section className="space-y-6">
    <div>
      <h2 className="text-3xl font-semibold text-stone-900">Gestión de Clientes</h2>
      <p className="text-stone-600 mt-2">Administra altas, estados y categorías de clientes clave.</p>
    </div>

    <div className="bg-white border border-stone-100 rounded-2xl shadow-card overflow-hidden">
      <table className="min-w-full divide-y divide-stone-100">
        <thead className="bg-stone-50 text-left text-xs uppercase tracking-widest text-stone-500">
          <tr>
            <th className="px-6 py-3">Cliente</th>
            <th className="px-6 py-3">Categoría</th>
            <th className="px-6 py-3">Estado</th>
            <th className="px-6 py-3">Fecha de alta</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 text-sm text-stone-700">
          {customers.map((cliente) => (
            <tr key={cliente.nombre}>
              <td className="px-6 py-4 font-semibold text-stone-900">{cliente.nombre}</td>
              <td className="px-6 py-4">{cliente.categoria}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    cliente.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {cliente.estado}
                </span>
              </td>
              <td className="px-6 py-4">{cliente.alta}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default Clientes;
