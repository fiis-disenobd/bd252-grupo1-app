const productos = [
  { nombre: 'Res canal A', tipo: 'Canal', precio: 'S/ 12.40', stock: '120 uds' },
  { nombre: 'Menudencia premium', tipo: 'Línea fría', precio: 'S/ 8.60', stock: '78 uds' },
  { nombre: 'Servicios de faenado', tipo: 'Servicio', precio: 'S/ 3.50', stock: 'Bajo demanda' },
];

const Productos = () => (
  <section className="space-y-6">
    <div>
      <h2 className="text-3xl font-semibold text-stone-900">Catálogo de Productos</h2>
      <p className="text-stone-600 mt-2">Controla precios de lista, tipo de producto y stock disponible.</p>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      {productos.map((producto) => (
        <article key={producto.nombre} className="bg-white rounded-2xl border border-stone-100 p-6 shadow-card">
          <h3 className="text-xl font-semibold text-stone-900">{producto.nombre}</h3>
          <p className="text-sm text-stone-500 mt-1">{producto.tipo}</p>
          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="font-bold text-primary">{producto.precio}</span>
            <span className="text-stone-500">{producto.stock}</span>
          </div>
        </article>
      ))}
    </div>
  </section>
);

export default Productos;
