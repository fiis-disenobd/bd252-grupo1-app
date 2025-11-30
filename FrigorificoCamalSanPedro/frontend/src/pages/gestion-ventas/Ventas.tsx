const ventas = [
  { pedido: 'VTA-2458', cliente: 'Distribuciones Lima', estado: 'Facturado', monto: 'S/ 48,520' },
  { pedido: 'VTA-2459', cliente: 'Carnes del Sur', estado: 'En despacho', monto: 'S/ 32,180' },
  { pedido: 'VTA-2460', cliente: 'Mercados Unidos', estado: 'Pendiente', monto: 'S/ 21,340' },
];

const Ventas = () => (
  <section className="space-y-6">
    <div>
      <h2 className="text-3xl font-semibold text-stone-900">Cierre de Ventas</h2>
      <p className="text-stone-600 mt-2">Control operatividad diaria de pedidos y facturación.</p>
    </div>
    <div className="bg-white rounded-2xl border border-stone-100 shadow-card overflow-hidden">
      <table className="min-w-full divide-y divide-stone-100">
        <thead className="bg-stone-50 text-xs uppercase tracking-widest text-stone-500">
          <tr>
            <th className="px-6 py-3 text-left">Pedido</th>
            <th className="px-6 py-3 text-left">Cliente</th>
            <th className="px-6 py-3 text-left">Estado</th>
            <th className="px-6 py-3 text-left">Monto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 text-sm">
          {ventas.map((venta) => (
            <tr key={venta.pedido}>
              <td className="px-6 py-4 font-semibold text-stone-900">{venta.pedido}</td>
              <td className="px-6 py-4">{venta.cliente}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    venta.estado === 'Facturado'
                      ? 'bg-emerald-100 text-emerald-800'
                      : venta.estado === 'En despacho'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {venta.estado}
                </span>
              </td>
              <td className="px-6 py-4 font-semibold">{venta.monto}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default Ventas;
