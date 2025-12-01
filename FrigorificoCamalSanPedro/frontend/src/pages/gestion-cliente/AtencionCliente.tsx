import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type SolicitudDoc = {
  id_solicitud: number;
  codigo_cliente: string;
  documento: string | null;
  nombre_cliente: string | null;
  archivo: string | null;
  estado: string | null;
};

const AtencionCliente = () => {
  const bucketName = 'documentos_clientes';
  const [showList, setShowList] = useState(false);
  const [solicitudesDoc, setSolicitudesDoc] = useState<SolicitudDoc[]>([]);
  const [lastUpload, setLastUpload] = useState<{ name: string; url: string } | null>(null);
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudDoc | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [comentario, setComentario] = useState('');
  const [accionMensaje, setAccionMensaje] = useState<string | null>(null);

  const loadSolicitudesDoc = async () => {
    const { data, error } = await supabase.rpc('listar_solicitudes_docu');
    if (error) {
      console.warn('No se pudo cargar solicitudes en revision', error.message);
      return;
    }
    setSolicitudesDoc(data as SolicitudDoc[]);
    setShowList(true);
  };

  const handleRevisar = (s: SolicitudDoc) => {
    setSelectedSolicitud(s);
    if (s.archivo) {
      const url = supabase.storage.from(bucketName).getPublicUrl(s.archivo).data.publicUrl;
      setLastUpload({ name: s.archivo, url });
      setShowPreview(true);
    } else {
      setLastUpload(null);
      setShowPreview(false);
    }
  };

  const handleAprobar = async () => {
    if (!selectedSolicitud) return;
    const { error } = await supabase.rpc('actualizar_documento_solicitud', {
      p_id_solicitud: selectedSolicitud.id_solicitud,
      p_estado_validacion: 'Aprobado',
      p_observacion: null
    });
    if (error) {
      setAccionMensaje(`Error al aprobar: ${error.message}`);
      return;
    }
    setAccionMensaje('Documentos aprobados');
    setComentario('');
    await loadSolicitudesDoc();
  };

  const handleSolicitarNuevo = async () => {
    if (!selectedSolicitud) return;
    const { error } = await supabase.rpc('actualizar_documento_solicitud', {
      p_id_solicitud: selectedSolicitud.id_solicitud,
      p_estado_validacion: 'Observado',
      p_observacion: comentario || 'Se requiere nueva documentación'
    });
    if (error) {
      setAccionMensaje(`Error al solicitar nuevo envío: ${error.message}`);
      return;
    }
    setAccionMensaje('Solicitud de nueva documentación enviada');
    setComentario('');
    await loadSolicitudesDoc();
  };

  const TabsNav = () => (
    <div className="px-6 py-4 flex flex-wrap gap-3">
      <a
        href="/clientes"
        className="px-4 py-2 text-sm font-semibold rounded-lg border transition bg-white border-stone-300 text-stone-700 hover:border-primary/50"
      >
        Cliente
      </a>
      <a
        href="/clientes/atencion"
        className="px-4 py-2 text-sm font-semibold rounded-lg border transition bg-primary text-white border-primary"
      >
        Atencion al Cliente
      </a>
      <span className="px-4 py-2 text-sm font-semibold rounded-lg border bg-white border-stone-200 text-stone-400">
        Ejecutivo de Ventas
      </span>
    </div>
  );

  return (
    <section className="space-y-8">
      <div className="rounded-2xl bg-white border border-stone-200 shadow-card overflow-hidden">
        <div className="bg-primary text-white px-6 py-4">
          <h2 className="text-2xl font-semibold">Atencion al Cliente</h2>
        </div>

        <TabsNav />

        {!showList && (
        <div className="px-6 py-12 flex flex-col md:flex-row items-center justify-center gap-16">
          <button
            className="w-72 h-28 rounded-lg bg-primary text-white font-semibold text-sm shadow-[0_4px_10px_rgba(0,0,0,0.25)] border border-primary/80 hover:brightness-110 transition"
            onClick={loadSolicitudesDoc}
          >
            Verificar Documentacion
            </button>
            <button className="w-72 h-28 rounded-lg bg-primary text-white font-semibold text-sm shadow-[0_4px_10px_rgba(0,0,0,0.25)] border border-primary/80 hover:brightness-110 transition">
              Buscar Cliente
            </button>
          </div>
        )}

        {showList && (
          <div className="px-6 py-8 space-y-6">
            <div className="bg-white border border-stone-400 rounded-xl shadow-card p-4">
              <h3 className="text-xl font-semibold text-stone-800 mb-3">
                Clientes <span className="text-primary">En revision</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-stone-400">
                  <thead className="bg-stone-200 text-stone-800">
                    <tr>
                      <th className="px-3 py-2 text-left border border-stone-400">dni</th>
                      <th className="px-3 py-2 text-left border border-stone-400">nombre del cliente</th>
                      <th className="px-3 py-2 border border-stone-400 text-center">Revisar documentos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudesDoc.map((s) => (
                      <tr key={s.id_solicitud} className="border border-stone-400">
                        <td className="px-3 py-2 border border-stone-300">{s.documento}</td>
                        <td className="px-3 py-2 border border-stone-300">{s.nombre_cliente}</td>
                        <td className="px-3 py-2 border border-stone-300 text-center">
                          <button
                            className="px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold shadow-sm"
                            onClick={() => handleRevisar(s)}
                          >
                            Revisar Documentos
                          </button>
                        </td>
                      </tr>
                    ))}
                    {solicitudesDoc.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-3 py-4 text-center text-stone-500">
                          No hay clientes en revisión.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedSolicitud && (
          <div className="bg-white border border-stone-200 rounded-xl shadow-card p-5 grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <div>
              <p className="text-stone-800 font-semibold">{selectedSolicitud.nombre_cliente}</p>
              <p className="text-sm text-stone-600 mb-4">DNI/RUC: {selectedSolicitud.documento}</p>
                  {lastUpload && selectedSolicitud.archivo ? (
                    <div
                      className="rounded-md border border-dashed border-stone-300 bg-stone-50 p-3 cursor-pointer hover:border-primary/60"
                      onClick={() => setShowPreview(true)}
                    >
                      {lastUpload.url && lastUpload.name.match(/\.(png|jpe?g)$/i) ? (
                        <img src={lastUpload.url} alt={lastUpload.name} className="max-h-60 w-full object-contain" />
                      ) : (
                        <div className="flex items-center justify-between text-stone-700 text-xs">
                          <span className="truncate">{lastUpload.name}</span>
                          <span className="text-primary font-semibold">Ver</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-stone-500">Sin documento adjunto.</p>
                  )}
            </div>
            <div className="space-y-3">
              <button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-md py-3 font-semibold"
                onClick={handleAprobar}
              >
                Aprobar
              </button>
              <div className="space-y-2">
                <button
                  className="w-full bg-red-500 hover:bg-red-600 text-white rounded-md py-3 font-semibold"
                  onClick={handleSolicitarNuevo}
                >
                  Solicitar nuevo envio de documentacion
                </button>
                <textarea
                  className="w-full border border-stone-300 rounded-md p-2 text-sm"
                  placeholder="Ingresa un comentario para el cliente"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                />
              </div>
              {accionMensaje && (
                <p className="text-sm font-semibold text-stone-700">{accionMensaje}</p>
              )}
            </div>
          </div>
        )}
          </div>
        )}
      </div>

      {showPreview && lastUpload?.url && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
              <p className="font-semibold text-stone-800 text-sm truncate">{lastUpload.name}</p>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Cerrar
              </button>
            </div>
            <div className="max-h-[80vh] bg-stone-50">
              {lastUpload.name.match(/\.(png|jpe?g)$/i) ? (
                <img src={lastUpload.url} alt={lastUpload.name} className="w-full h-full object-contain" />
              ) : (
                <iframe src={lastUpload.url} title="Preview" className="w-full h-[75vh]" />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AtencionCliente;
