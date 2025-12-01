import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrazabilidad } from '@/features/trazabilidad/hooks';

const ReporteTrazabilidad = () => {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState('PZ-2025-000001');
  const [buscarCodigo, setBuscarCodigo] = useState('PZ-2025-000001');
  const { detalle, detalleLista, reclamos, loading, error } = useTrazabilidad(buscarCodigo);

  const handleBuscar = () => {
    setBuscarCodigo(codigo.trim());
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
          <h2 className="text-3xl font-semibold text-stone-900">Trazabilidad de Pieza</h2>
        </div>
        {/* Exportar deshabilitado/oculto por solicitud */}
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-stone-700 font-semibold">
          <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 5h16v14H4z" />
            <path d="M9 5v14" />
            <path d="M15 5v14" />
            <path d="M4 9h16" />
            <path d="M4 15h16" />
          </svg>
          <span>Buscar Pieza</span>
        </div>
        <label className="flex flex-col gap-2 text-sm text-stone-700">
          <span className="font-semibold">Código de Pieza o QR</span>
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="flex-1 min-w-[220px] rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              onClick={handleBuscar}
              className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-[#5a2b0d]"
              disabled={!codigo}
            >
              Buscar
            </button>
            <button className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 text-sm font-semibold" disabled>
              Escanear QR
            </button>
          </div>
        </label>
        {loading && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Consultando trazabilidad...
          </div>
        )}
        {/* Mensaje de éxito removido a solicitud */}
        {!loading && !detalle && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            No se encontró trazabilidad para el código ingresado.
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            Error: {error}
          </div>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-card p-6 space-y-6">
        <div className="flex items-center gap-2 text-stone-700 font-semibold">
          <span className="text-primary text-lg">●</span>
          <span>Pieza Final</span>
        </div>
        {detalle ? (
          <div className="grid gap-4 md:grid-cols-2 text-sm text-stone-700">
            <div className="space-y-2">
              <div>
                <p className="text-xs uppercase text-stone-500">Código</p>
                <p className="text-lg font-semibold text-stone-900">{detalle.codigo}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-stone-500">Especie</p>
                <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                  {detalle.especie}
                </span>
              </div>
              <div>
                <p className="text-xs uppercase text-stone-500">Peso Final (kg)</p>
                <p className="font-semibold text-stone-900">{detalle.pesoFinalKg} kg</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs uppercase text-stone-500">Fecha de Beneficio</p>
                <p className="font-semibold text-stone-900">
                  {detalle.fechaBeneficio} {detalle.horaBeneficio}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-stone-500">Cámara</p>
                <p className="font-semibold text-stone-900">{detalle.camara}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-stone-500">Comisionado</p>
                <p className="font-semibold text-stone-900">{detalle.comisionado}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-stone-500">Cliente</p>
                <p className="font-semibold text-stone-900">{detalle.cliente}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-stone-500">Estado de Reclamo</p>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                  {detalle.estadoReclamo}
                </span>
              </div>
            </div>
          </div>
        ) : detalleLista.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-stone-700">
              <thead className="bg-stone-50 text-left text-xs uppercase tracking-widest text-stone-500">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Especie</th>
                  <th className="px-4 py-3">Peso (kg)</th>
                  <th className="px-4 py-3">Beneficio</th>
                  <th className="px-4 py-3">Cámara</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Estado Reclamo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {detalleLista.map((p) => (
                  <tr key={p.codigo} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-semibold text-stone-900">{p.codigo}</td>
                    <td className="px-4 py-3">{p.especie}</td>
                    <td className="px-4 py-3">{p.pesoFinalKg}</td>
                    <td className="px-4 py-3">
                      {p.fechaBeneficio} {p.horaBeneficio}
                    </td>
                    <td className="px-4 py-3">{p.camara}</td>
                    <td className="px-4 py-3">{p.cliente}</td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                        {p.estadoReclamo}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-stone-500">Sin datos de pieza. Intenta otra búsqueda.</p>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center gap-2 text-stone-700 font-semibold">
          <span className="text-amber-600">⚠</span>
          <span>Reclamos Asociados ({reclamos.length})</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-stone-700">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-widest text-stone-500">
              <tr>
                <th className="px-6 py-3">Tipo de Reclamo</th>
                <th className="px-6 py-3">Urgencia</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Descripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading && (
                <tr>
                  <td className="px-6 py-4 text-center text-stone-500" colSpan={4}>
                    Cargando reclamos...
                  </td>
                </tr>
              )}
              {!loading && reclamos.length === 0 && (
                <tr>
                  <td className="px-6 py-4 text-center text-stone-500" colSpan={4}>
                    No hay reclamos para este pedido.
                  </td>
                </tr>
              )}
              {!loading &&
                reclamos.map((rec) => (
                  <tr key={`${rec.tipoReclamo}-${rec.estado}-${rec.descripcion}`} className="hover:bg-stone-50">
                    <td className="px-6 py-4 font-semibold text-stone-900">{rec.tipoReclamo}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          rec.urgencia === 'MEDIA'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {rec.urgencia}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                        {rec.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">{rec.descripcion}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ReporteTrazabilidad;
