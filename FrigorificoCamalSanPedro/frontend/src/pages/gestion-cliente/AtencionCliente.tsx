import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { API_BASE_URL } from '../../services/api';

type SolicitudDoc = {
  id_solicitud: number;
  codigo_cliente: string;
  documento: string | null;
  nombre_cliente: string | null;
  archivo: string | null;
  estado: string | null;
  observacion?: string | null;
  id_documento?: number;
  estado_validacion?: string | null;
};

type ClienteData = {
  id_cliente: number;
  codigo_cliente: string;
  tipo: string; // Changed from tipo_cliente to tipo
  documento: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
  direccion: string;
};

const AtencionCliente = () => {
  const bucketName = 'documentos_clientes';
  const [showList, setShowList] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [solicitudesDoc, setSolicitudesDoc] = useState<SolicitudDoc[]>([]);
  const [lastUpload, setLastUpload] = useState<{ name: string; url: string } | null>(null);
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudDoc | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [comentario, setComentario] = useState('');
  const [accionMensaje, setAccionMensaje] = useState<string | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<ClienteData | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Purchase History State
  const [compras, setCompras] = useState<any[]>([]);
  const [loadingCompras, setLoadingCompras] = useState(false);

  const fetchCompras = async (clienteId: number) => {
    setLoadingCompras(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ventas/cliente/${clienteId}`);
      if (response.ok) {
        const data = await response.json();
        setCompras(data);
      } else {
        console.error('Error fetching compras');
        setCompras([]);
      }
    } catch (error) {
      console.error('Error fetching compras:', error);
      setCompras([]);
    } finally {
      setLoadingCompras(false);
    }
  };

  const loadSolicitudesDoc = async () => {
    const { data: rpcData, error } = await supabase.rpc('listar_solicitudes_docu');
    if (error) {
      console.warn('No se pudo cargar solicitudes en revision', error.message);
      return;
    }

    const solicitudes = rpcData as SolicitudDoc[];
    const ids = solicitudes.map(s => s.id_solicitud);

    if (ids.length > 0) {
      const { data: docsData } = await supabase
        .from('documento_enviado')
        .select('id_solicitud, id_documento, estado_validacion, observacion, fecha_subida')
        .in('id_solicitud', ids)
        .order('fecha_subida', { ascending: false });

      if (docsData) {
        solicitudes.forEach(s => {
          const latestDoc = docsData.find(d => d.id_solicitud === s.id_solicitud);
          if (latestDoc) {
            s.id_documento = latestDoc.id_documento;
            s.estado_validacion = latestDoc.estado_validacion;
            s.observacion = latestDoc.observacion;
          }
        });
      }
    }

    console.log('Solicitudes Doc Data (Enriched):', solicitudes);
    setSolicitudesDoc(solicitudes);
    setShowList(true);
    setShowSearch(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError(null);
    setSearchResult(null);

    try {
      const { data, error } = await supabase.rpc('buscar_cliente_admin', { p_busqueda: searchQuery });

      if (error) throw error;

      if (data && data.length > 0) {
        setSearchResult(data[0]);
        fetchCompras(data[0].id_cliente);
      } else {
        setSearchError('No se encontraron clientes con ese criterio.');
      }
    } catch (err: any) {
      setSearchError(`Error en la búsqueda: ${err.message}`);
    } finally {
      setSearching(false);
    }
  };



  const handleRevisar = (s: SolicitudDoc) => {
    setSelectedSolicitud(s);
    setShowRejectInput(false);
    setAccionMensaje(null);
    if (s.archivo) {
      const url = supabase.storage.from(bucketName).getPublicUrl(s.archivo).data.publicUrl;
      setLastUpload({ name: s.archivo, url });
      setShowPreview(true);
    } else {
      setLastUpload(null);
      setAccionMensaje('El cliente no tiene un archivo adjunto válido.');
    }
  };

  const handleAprobar = async () => {
    if (!selectedSolicitud) return;

    try {
      let docId = selectedSolicitud.id_documento;

      if (!docId) {
        const { data: docs, error: rpcError } = await supabase.rpc('listar_documentos_solicitud', {
          p_id_solicitud: selectedSolicitud.id_solicitud
        });

        if (rpcError) {
          console.error('RPC fetch failed:', rpcError);
          throw new Error(`Error buscando documentos: ${rpcError.message}`);
        }

        if (Array.isArray(docs) && docs.length > 0) {
          const match = docs.find((d: any) => d.archivo === selectedSolicitud.archivo || d.nombre_archivo === selectedSolicitud.archivo) || docs[0];
          docId = match.id_documento;
        }
      }

      if (!docId) throw new Error('No se pudo obtener el ID del documento (RPC no devolvió ID).');

      const { error: revError } = await supabase.from('revision').insert({
        id_documento: docId,
        id_usuario: 1,
        resultado: 'Aprobado',
        comentario: null,
        fecha_hora: new Date().toISOString()
      });

      if (revError) throw revError;

      const { error: solError } = await supabase
        .from('solicitud_registro')
        .update({ estado_actual: 'Cond' })
        .eq('id_solicitud', selectedSolicitud.id_solicitud);

      if (solError) throw solError;

      await supabase
        .from('documento_enviado')
        .update({ estado_validacion: 'Aprobado', observacion: null })
        .eq('id_documento', docId)
        .then(({ error }) => { if (error) console.warn('Could not update documento_enviado status:', error.message); });

      setAccionMensaje('Documentos aprobados');
      setComentario('');
      await loadSolicitudesDoc();
    } catch (error: any) {
      setAccionMensaje(`Error al aprobar: ${error.message}`);
    }
  };

  const handleSolicitarNuevo = async () => {
    if (!selectedSolicitud) return;

    try {
      let docId = selectedSolicitud.id_documento;

      if (!docId) {
        const { data: docs, error: rpcError } = await supabase.rpc('listar_documentos_solicitud', {
          p_id_solicitud: selectedSolicitud.id_solicitud
        });

        if (rpcError) throw new Error(`Error buscando documentos: ${rpcError.message}`);

        if (Array.isArray(docs) && docs.length > 0) {
          const match = docs.find((d: any) => d.archivo === selectedSolicitud.archivo || d.nombre_archivo === selectedSolicitud.archivo) || docs[0];
          docId = match.id_documento;
        }
      }

      if (!docId) throw new Error('No se pudo obtener el ID del documento.');

      const { error: revError } = await supabase.from('revision').insert({
        id_documento: docId,
        id_usuario: 1,
        resultado: 'Observado',
        comentario: comentario || 'Se requiere nueva documentación',
        fecha_hora: new Date().toISOString()
      });

      if (revError) throw revError;

      const { error: solError } = await supabase
        .from('solicitud_registro')
        .update({ estado_actual: 'Docu' })
        .eq('id_solicitud', selectedSolicitud.id_solicitud);

      if (solError) throw solError;

      await supabase
        .from('documento_enviado')
        .update({
          estado_validacion: 'Observado',
          observacion: comentario || 'Se requiere nueva documentación'
        })
        .eq('id_documento', docId)
        .then(({ error }) => { if (error) console.warn('Could not update documento_enviado status:', error.message); });

      setAccionMensaje('Solicitud de nueva documentación enviada');
      setComentario('');
      await loadSolicitudesDoc();
    } catch (error: any) {
      setAccionMensaje(`Error al solicitar nuevo envío: ${error.message}`);
    }
  };

  const handleRevertir = async () => {
    if (!selectedSolicitud) return;

    try {
      let docId = selectedSolicitud.id_documento;
      if (!docId) {
        const { data: docs } = await supabase.rpc('listar_documentos_solicitud', { p_id_solicitud: selectedSolicitud.id_solicitud });
        if (docs && docs.length > 0) docId = docs[0].id_documento;
      }

      if (!docId) throw new Error('No se pudo identificar el documento para revertir.');

      const { error: solError } = await supabase
        .from('solicitud_registro')
        .update({ estado_actual: 'Docu' })
        .eq('id_solicitud', selectedSolicitud.id_solicitud);

      if (solError) throw solError;

      await supabase
        .from('documento_enviado')
        .update({ estado_validacion: 'Pendiente', observacion: null })
        .eq('id_documento', docId);

      await supabase.from('revision').insert({
        id_documento: docId,
        id_usuario: 1,
        resultado: 'Revertido',
        comentario: 'Aprobación revertida manualmente',
        fecha_hora: new Date().toISOString()
      });

      setAccionMensaje('Aprobación revertida');
      await loadSolicitudesDoc();
      setSelectedSolicitud(null);
    } catch (error: any) {
      setAccionMensaje(`Error al revertir: ${error.message}`);
    }
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
    </div>
  );

  return (
    <section className="space-y-8">
      <div className="rounded-2xl bg-white border border-stone-200 shadow-card overflow-hidden">
        <div className="bg-primary text-white px-6 py-4">
          <h2 className="text-2xl font-semibold">Atencion al Cliente</h2>
        </div>

        <TabsNav />

        {!showList && !showSearch && (
          <div className="px-6 py-12 flex flex-col md:flex-row items-center justify-center gap-16">
            <button
              className="w-72 h-28 rounded-lg bg-primary text-white font-semibold text-sm shadow-[0_4px_10px_rgba(0,0,0,0.25)] border border-primary/80 hover:brightness-110 transition"
              onClick={loadSolicitudesDoc}
            >
              Verificar Documentacion
            </button>
            <button
              className="w-72 h-28 rounded-lg bg-primary text-white font-semibold text-sm shadow-[0_4px_10px_rgba(0,0,0,0.25)] border border-primary/80 hover:brightness-110 transition"
              onClick={() => { setShowSearch(true); setShowList(false); }}
            >
              Buscar Cliente
            </button>
          </div>
        )}

        {showSearch && (
          <div className="px-6 py-8 space-y-8">
            <div className="flex items-center gap-4 max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Buscar por Nombre o DNI/RUC..."
                className="flex-1 rounded-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                className="px-6 py-3 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:brightness-110 transition disabled:opacity-50"
                onClick={handleSearch}
                disabled={searching}
              >
                {searching ? 'Buscando...' : 'Buscar'}
              </button>
            </div>

            {searchError && (
              <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                {searchError}
              </div>
            )}

            {searchResult && (
              <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8">
                {/* Datos del Cliente */}
                <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-6 max-w-4xl mx-auto">
                  <h3 className="text-xl font-bold text-stone-800 mb-6 border-b border-stone-100 pb-2">Datos del Cliente</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold text-stone-600">Nombre del cliente:</span>
                      <span className="text-stone-800">{searchResult.tipo === 'pj' ? searchResult.nombres : `${searchResult.nombres} ${searchResult.apellidos}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-stone-600">RUC/DNI:</span>
                      <span className="text-stone-800">{searchResult.documento}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-stone-600">Nombre del representante:</span>
                      <span className="text-stone-800">{searchResult.tipo === 'pj' ? 'N/A' : `${searchResult.nombres} ${searchResult.apellidos}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-stone-600">Número telefónico:</span>
                      <span className="text-stone-800">{searchResult.telefono}</span>
                    </div>
                    <div className="flex justify-between md:col-span-2">
                      <span className="font-semibold text-stone-600">Correo empresarial:</span>
                      <span className="text-stone-800">{searchResult.correo}</span>
                    </div>
                  </div>
                </div>

                {/* Reclamos Activos */}
                <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-6 max-w-4xl mx-auto">
                  <h3 className="text-xl font-bold text-stone-800 mb-4">Reclamos Activos</h3>
                  <div className="bg-stone-50 rounded-lg p-8 text-center border border-dashed border-stone-300">
                    <p className="text-stone-500">No hay reclamos activos para este cliente.</p>
                  </div>
                </div>

                {/* Historial de Compras */}
                <div className="bg-white border border-stone-200 rounded-xl shadow-sm p-6 max-w-4xl mx-auto">
                  <h3 className="text-xl font-bold text-stone-800 mb-4">Historial de Compras</h3>
                  {loadingCompras ? (
                    <div className="text-center py-8 text-stone-500">Cargando historial...</div>
                  ) : compras.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border border-stone-200">
                        <thead className="bg-stone-100 text-stone-700">
                          <tr>
                            <th className="px-4 py-2 text-left border-b">Fecha</th>
                            <th className="px-4 py-2 text-left border-b">Productos</th>
                            <th className="px-4 py-2 text-right border-b">Total</th>
                            <th className="px-4 py-2 text-center border-b">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {compras.map((compra, idx) => (
                            <tr key={idx} className="border-b hover:bg-stone-50">
                              <td className="px-4 py-2 text-stone-600">
                                {new Date(compra.fecha).toLocaleDateString()} {new Date(compra.fecha).toLocaleTimeString()}
                              </td>
                              <td className="px-4 py-2 text-stone-600">
                                <ul className="list-disc list-inside">
                                  {compra.items.map((item: any, i: number) => (
                                    <li key={i}>
                                      {item.nombre} x {item.cantidad} ({item.unidad})
                                    </li>
                                  ))}
                                </ul>
                              </td>
                              <td className="px-4 py-2 text-right font-semibold text-stone-800">
                                S/ {compra.total.toFixed(2)}
                              </td>
                              <td className="px-4 py-2 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${compra.estado === 'completado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {compra.estado}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-stone-50 rounded-lg p-8 text-center border border-dashed border-stone-300">
                      <p className="text-stone-500">No hay historial de compras disponible.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <button
                className="text-stone-500 hover:text-primary underline text-sm"
                onClick={() => { setShowSearch(false); setSearchResult(null); setSearchQuery(''); }}
              >
                Volver al menú principal
              </button>
            </div>
          </div>
        )}

        {showList && (
          <div className="px-6 py-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-stone-800">
                Clientes <span className="text-primary">En revision</span>
              </h3>
              <button
                className="text-sm text-stone-500 hover:text-primary underline"
                onClick={() => setShowList(false)}
              >
                Volver
              </button>
            </div>

            <div className="bg-white border border-stone-400 rounded-xl shadow-card p-4">
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
                        <td className="px-3 py-2 border border-stone-300">
                          <div className="flex items-center justify-between">
                            <span>{s.nombre_cliente}</span>
                            {s.estado === 'Cond' ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                                Aprobado
                              </span>
                            ) : s.estado === 'Docu' ? (
                              s.estado_validacion === 'Observado' ? (
                                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold border border-red-200">
                                  Por corregir
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200">
                                  Subsanado
                                </span>
                              )
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200">
                                Pendiente
                              </span>
                            )}
                          </div>
                        </td>
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
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-stone-800 font-semibold">{selectedSolicitud.nombre_cliente}</p>
                    {selectedSolicitud.estado === 'Cond' ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">
                        Aprobado
                      </span>
                    ) : selectedSolicitud.estado === 'Docu' ? (
                      selectedSolicitud.estado_validacion === 'Observado' ? (
                        <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">
                          Por corregir
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200">
                          Subsanado
                        </span>
                      )
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
                        Pendiente
                      </span>
                    )}
                  </div>
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
                  {selectedSolicitud.estado === 'Cond' ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                        <p className="text-emerald-700 font-semibold text-sm">Esta documentación ha sido aprobada</p>
                      </div>
                      <button
                        className="w-full bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-md py-3 font-semibold transition"
                        onClick={handleRevertir}
                      >
                        Revertir Aprobación
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-md py-3 font-semibold transition"
                        onClick={handleAprobar}
                      >
                        Aprobar
                      </button>

                      {!showRejectInput ? (
                        <button
                          className="w-full bg-red-500 hover:bg-red-600 text-white rounded-md py-3 font-semibold transition"
                          onClick={() => setShowRejectInput(true)}
                        >
                          Solicitar nuevo envio de documentacion
                        </button>
                      ) : (
                        <div className="space-y-2 bg-stone-50 p-3 rounded-lg border border-stone-200 animate-in fade-in slide-in-from-top-2">
                          <p className="text-xs font-semibold text-stone-700">Comentario de corrección:</p>
                          <textarea
                            className="w-full border border-stone-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            placeholder="Los documentos no estan legibles. Por favor volver a subir."
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-md py-2 text-sm font-semibold transition"
                              onClick={() => {
                                setShowRejectInput(false);
                                setComentario('');
                              }}
                            >
                              Cancelar
                            </button>
                            <button
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-md py-2 text-sm font-semibold transition"
                              onClick={handleSolicitarNuevo}
                            >
                              Enviar
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {accionMensaje && (
                    <p className="text-sm font-semibold text-stone-700 text-center animate-pulse">{accionMensaje}</p>
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
