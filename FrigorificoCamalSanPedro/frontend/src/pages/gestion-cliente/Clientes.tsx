import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type FormState = {
  nombres: string;
  apellidos: string;
  tipoCliente: 'pn' | 'pj' | '';
  documento: string;
  telefono: string;
  correo: string;
  direccion: string;
  pais: string;
  region: string;
  ciudad: string;
};

const initialState: FormState = {
  nombres: '',
  apellidos: '',
  tipoCliente: '',
  documento: '',
  telefono: '',
  correo: '',
  direccion: '',
  pais: '',
  region: '',
  ciudad: '',
};

const Clientes = () => {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentStep, setCurrentStep] = useState<0 | 1>(0);
  const [solicitudId, setSolicitudId] = useState<number | null>(null);
  const [docStatus, setDocStatus] = useState<'Subida' | 'EnRevision'>('Subida');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [codigoCliente, setCodigoCliente] = useState<string | null>(null);
  const [existingDoc, setExistingDoc] = useState('');
  const [existingEmail, setExistingEmail] = useState('');
  const [uploading, setUploading] = useState(false);
  const bucketName = 'documentos_clientes';
  const [lastUpload, setLastUpload] = useState<{ name: string; url: string } | null>(null);
  const [estadoSolicitud, setEstadoSolicitud] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [mode, setMode] = useState<'nuevo' | 'existente'>('nuevo');

  const TabsNav = () => (
    <div className="px-6 py-4 flex flex-wrap gap-3">
      <a
        href="/clientes"
        className="px-4 py-2 text-sm font-semibold rounded-lg border transition bg-primary text-white border-primary"
      >
        Cliente
      </a>
      <a
        href="/clientes/atencion"
        className="px-4 py-2 text-sm font-semibold rounded-lg border transition bg-white border-stone-300 text-stone-700 hover:border-primary/50"
      >
        Atencion al Cliente
      </a>
      <span className="px-4 py-2 text-sm font-semibold rounded-lg border bg-white border-stone-200 text-stone-400">
        Ejecutivo de Ventas
      </span>
    </div>
  );

  const isValid = useMemo(() => {
    return (
      form.nombres.trim() &&
      form.apellidos.trim() &&
      form.tipoCliente &&
      form.documento.trim() &&
      form.telefono.trim() &&
      form.correo.trim() &&
      form.direccion.trim() &&
      form.pais.trim() &&
      form.region.trim() &&
      form.ciudad.trim()
    );
  }, [form]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    setMessage(null);

    const payload = {
      p_tipo: form.tipoCliente,
      p_documento: form.documento.trim(),
      p_nombres: form.nombres.trim(),
      p_apellidos: form.apellidos.trim(),
      p_telefono: form.telefono.trim(),
      p_correo: form.correo.trim(),
      p_pais: form.pais.trim(),
      p_region: form.region.trim(),
      p_ciudad: form.ciudad.trim()
    };

    const { data, error } = await supabase.rpc('create_cliente', payload);

    if (error) {
      setMessage({ type: 'error', text: `No se pudo registrar: ${error.message}` });
    } else {
      const created = Array.isArray(data) ? data[0] : null;
      setSolicitudId(created?.solicitud_id ?? null);
      setCodigoCliente(created?.codigo_cliente ?? null);
      setCurrentStep(1);
      setDocStatus('Subida');
      setMessage({ type: 'success', text: 'Cliente registrado correctamente. Continua con la documentacion.' });
      setForm(initialState);
    }

    setSubmitting(false);
  };

  const loadDocsByCodigo = async (codigo: string) => {
    const { data, error } = await supabase.rpc('obtener_documentos_cliente', { p_codigo_cliente: codigo });
    if (error) {
      console.warn('No se pudo cargar documentos por cliente', error.message);
      return;
    }
    if (Array.isArray(data) && data.length > 0) {
      const firstWithDoc =
        data.find((item: any) => item.archivo || item.nombre_archivo) ?? data[0];
      if (firstWithDoc.id_solicitud) {
        setSolicitudId(firstWithDoc.id_solicitud);
      }
      if (firstWithDoc.estado_solicitud) {
        setEstadoSolicitud(firstWithDoc.estado_solicitud);
      }
      const filePath = firstWithDoc.archivo ?? firstWithDoc.nombre_archivo;
      if (filePath) {
        const url = supabase.storage.from(bucketName).getPublicUrl(filePath).data.publicUrl;
        setLastUpload({ name: filePath, url });
        setDocStatus('EnRevision');
        setMessage({ type: 'success', text: 'Ya enviaste un documento. Puedes subir otro si es necesario.' });
      } else {
        setLastUpload(null);
      }
    }
  };

  const loadExistingDocs = async (idSolicitud: number) => {
    const { data, error } = await supabase.rpc('listar_documentos_solicitud', { p_id_solicitud: idSolicitud });
    if (error) {
      console.warn('No se pudo cargar documentos previos', error.message);
      return;
    }
    if (Array.isArray(data) && data.length > 0) {
      const first = data.find((item: any) => item.archivo || item.nombre_archivo) ?? data[0];
      const filePath = first.archivo ?? first.nombre_archivo;
      if (filePath) {
        const url = supabase.storage.from(bucketName).getPublicUrl(filePath).data.publicUrl;
        setLastUpload({ name: filePath, url });
        setDocStatus('EnRevision');
        setMessage({ type: 'success', text: 'Ya enviaste un documento. Puedes subir otro si es necesario.' });
      }
    }
  };

  useEffect(() => {
    if (solicitudId) {
      void loadExistingDocs(solicitudId);
    }
  }, [solicitudId]);

  useEffect(() => {
    if (codigoCliente) {
      void loadDocsByCodigo(codigoCliente);
    }
  }, [codigoCliente]);

  useEffect(() => {
    if (estadoSolicitud === 'Docu') {
      setDocStatus('EnRevision');
    }
  }, [estadoSolicitud]);

  const handleUpload = async () => {
    if (!solicitudId) {
      setMessage({ type: 'error', text: 'No se encontro la solicitud del cliente.' });
      return;
    }
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Selecciona un archivo antes de continuar.' });
      return;
    }

    setUploading(true);
    setMessage(null);

    const path = `${solicitudId}/${Date.now()}_${selectedFile.name.replace(/\s+/g, '_')}`;

    const upload = await supabase.storage.from(bucketName).upload(path, selectedFile, {
      cacheControl: '3600',
      upsert: false
    });

    if (upload.error) {
      setMessage({ type: 'error', text: `No se pudo subir el archivo: ${upload.error.message}` });
      setUploading(false);
      return;
    }

    const { error } = await supabase.rpc('enviar_documento', {
      p_id_solicitud: solicitudId,
      p_id_tipo_doc: form.tipoCliente === 'pj' ? 2 : 1,
      p_nombre_archivo: path
    });

    if (error) {
      setMessage({ type: 'error', text: `No se pudo subir el documento: ${error.message}` });
    } else {
      setDocStatus('EnRevision');
      setSelectedFile(null);
      const publicUrl = supabase.storage.from(bucketName).getPublicUrl(path).data.publicUrl;
      setLastUpload({ name: selectedFile.name, url: publicUrl });
      setMessage({ type: 'success', text: 'Documento registrado y enviado a revision.' });
    }

    setUploading(false);
  };

  const handleExistingClient = async () => {
    if (!existingDoc.trim() || !existingEmail.trim()) {
      setMessage({ type: 'error', text: 'Ingresa DNI/RUC y correo para continuar.' });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    const { data, error } = await supabase.rpc('buscar_cliente_doc_email', {
      p_documento: existingDoc.trim(),
      p_correo: existingEmail.trim()
    });
    if (error) {
      setMessage({ type: 'error', text: `No se pudo validar: ${error.message}` });
    } else {
      const found = Array.isArray(data) ? data[0] : null;
      setSolicitudId(found?.id_solicitud ?? null);
      setCodigoCliente(found?.codigo_cliente ?? null);
      setCurrentStep(1);
      setDocStatus('Subida');
      setMode('existente');
      setMessage({ type: 'success', text: 'Cliente validado. Continua con la documentacion.' });
    }
    setSubmitting(false);
  };

  const renderClienteNuevo = () => (
    <form onSubmit={handleSubmit} className="px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <label className="block">
          <span className="block text-sm font-semibold text-stone-800 mb-2">Nombres</span>
          <input
            className="w-full rounded-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            placeholder="Juan Alejandro"
            value={form.nombres}
            onChange={(e) => handleChange('nombres', e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="block text-sm font-semibold text-stone-800 mb-2">Apellidos</span>
          <input
            className="w-full rounded-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            placeholder="Perez Rojas"
            value={form.apellidos}
            onChange={(e) => handleChange('apellidos', e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="block text-sm font-semibold text-stone-800 mb-2">Tipo de Cliente</span>
          <select
            className="w-full rounded-md border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            value={form.tipoCliente}
            onChange={(e) => handleChange('tipoCliente', e.target.value as FormState['tipoCliente'])}
            required
          >
            <option value="">Seleccione</option>
            <option value="pn">Persona Natural</option>
            <option value="pj">Persona Juridica</option>
          </select>
        </label>
        <label className="block">
          <span className="block text-sm font-semibold text-stone-800 mb-2">DNI / RUC</span>
          <input
            className="w-full rounded-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            placeholder="71666001"
            value={form.documento}
            onChange={(e) => handleChange('documento', e.target.value)}
            required
          />
        </label>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="block text-sm font-semibold text-stone-800 mb-2">Telefono</span>
          <input
            className="w-full rounded-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            placeholder="999888777"
            value={form.telefono}
            onChange={(e) => handleChange('telefono', e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="block text-sm font-semibold text-stone-800 mb-2">Correo</span>
          <input
            type="email"
            className="w-full rounded-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            placeholder="example@example.com"
            value={form.correo}
            onChange={(e) => handleChange('correo', e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="block text-sm font-semibold text-stone-800 mb-2">Direccion</span>
          <input
            className="w-full rounded-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            placeholder="Av Peru Mz C Lt 30"
            value={form.direccion}
            onChange={(e) => handleChange('direccion', e.target.value)}
            required
          />
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="block text-xs font-semibold text-stone-800 mb-2">Pais</span>
            <input
              className="w-full rounded-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              placeholder="Peru"
              value={form.pais}
              onChange={(e) => handleChange('pais', e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-stone-800 mb-2">Region</span>
            <input
              className="w-full rounded-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              placeholder="Lima"
              value={form.region}
              onChange={(e) => handleChange('region', e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-stone-800 mb-2">Ciudad</span>
            <input
              className="w-full rounded-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
              placeholder="Lima Centro"
              value={form.ciudad}
              onChange={(e) => handleChange('ciudad', e.target.value)}
              required
            />
          </label>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={!isValid || submitting}
            className={`w-40 px-8 py-3 rounded-md font-semibold text-sm transition shadow-sm ${
              isValid && !submitting ? 'bg-primary text-white hover:bg-primary/90' : 'bg-stone-300 text-stone-500 cursor-not-allowed'
            }`}
          >
            {submitting ? 'Guardando...' : 'Continuar'}
          </button>
          <button
            type="button"
            onClick={() => setMode('existente')}
            className="text-sm font-semibold text-primary hover:underline"
            disabled={submitting}
          >
            Ya soy cliente
          </button>
        </div>
      </div>
    </form>
  );

  const renderClienteExistente = () => (
    <div className="px-6 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end border border-stone-200 rounded-xl p-4 bg-stone-50">
        <label className="block">
          <span className="block text-xs font-semibold text-stone-800 mb-2">DNI / RUC</span>
          <input
            className="w-full rounded-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            value={existingDoc}
            onChange={(e) => setExistingDoc(e.target.value)}
            placeholder="71666001"
            required
          />
        </label>
        <label className="block">
          <span className="block text-xs font-semibold text-stone-800 mb-2">Correo</span>
          <input
            type="email"
            className="w-full rounded-full border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            value={existingEmail}
            onChange={(e) => setExistingEmail(e.target.value)}
            placeholder="example@example.com"
            required
          />
        </label>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleExistingClient}
            disabled={submitting}
            className={`w-full sm:w-32 px-4 py-2 rounded-md font-semibold text-sm transition shadow-sm ${
              !submitting ? 'bg-primary text-white hover:bg-primary/90' : 'bg-stone-300 text-stone-500'
            }`}
          >
            Validar
          </button>
          <button
            type="button"
            onClick={() => setMode('nuevo')}
            className="text-sm font-semibold text-primary hover:underline"
            disabled={submitting}
          >
            Volver a registro
          </button>
        </div>
      </div>
    </div>
  );

  const renderClienteTab = () => (
    <>
      {currentStep === 0 && mode === 'nuevo' && renderClienteNuevo()}
      {currentStep === 0 && mode === 'existente' && renderClienteExistente()}
      {currentStep === 1 && (
        <div className="px-6 py-6">
          <div className="mb-4 bg-stone-100 rounded-lg px-4 py-3 flex items-center gap-2">
            <span className="text-sm font-semibold text-stone-700">Estado:</span>
            <span className="text-lg font-bold text-primary">
              {docStatus === 'Subida' ? 'Subida de Documentos' : 'En revision'}
            </span>
            {codigoCliente && (
              <span className="ml-auto text-xs font-semibold text-stone-600">Codigo: {codigoCliente}</span>
            )}
          </div>

          <div className="text-sm text-stone-600 mb-6">
            {lastUpload
              ? 'Ya enviaste un documento. Puedes subir otro si consideras necesario.'
              : docStatus === 'Subida'
                ? 'Sube una copia de tu DNI/RUC para continuar.'
                : 'Estamos revisando tu documentacion. Puedes subir un nuevo archivo si lo necesitas.'}
          </div>

          <div className="max-w-xl mx-auto border border-stone-200 rounded-xl p-6 flex flex-col items-center gap-4">
            <label className="w-full cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-stone-300 rounded-xl py-8 hover:border-primary/70 transition">
              <span className="text-4xl mb-2 text-primary">⬆</span>
              <span className="text-sm font-semibold text-stone-700">Seleccionar archivo</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              {selectedFile && <span className="mt-3 text-xs text-stone-500">{selectedFile.name}</span>}
            </label>

            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className={`w-full max-w-[220px] px-8 py-3 rounded-md font-semibold text-sm transition shadow-sm ${
                !uploading ? 'bg-primary text-white hover:bg-primary/90' : 'bg-stone-300 text-stone-500'
              }`}
            >
              {uploading ? 'Enviando...' : 'Continuar'}
            </button>

            {lastUpload && (
              <div className="w-full max-w-[420px] rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-stone-800">Ultimo archivo enviado</p>
                  <span className="text-primary font-semibold text-xs">Enviado</span>
                </div>
                <div
                  className="rounded-md border border-dashed border-stone-300 bg-white p-3 cursor-pointer hover:border-primary/60 transition"
                  onClick={() => setShowPreview(true)}
                >
                  {lastUpload.url && lastUpload.name.match(/\.(png|jpe?g)$/i) ? (
                    <img
                      src={lastUpload.url}
                      alt={lastUpload.name}
                      className="max-h-40 w-full object-contain rounded"
                    />
                  ) : (
                    <div className="flex items-center justify-between text-stone-700 text-xs">
                      <span className="truncate">{lastUpload.name}</span>
                      <span className="text-primary font-semibold">Ver</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-stone-500">Puedes subir un archivo nuevo si deseas reemplazarlo.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <section className="space-y-8">
      <div className="rounded-2xl bg-white border border-stone-200 shadow-card overflow-hidden">
        <div className="bg-primary text-white px-6 py-4">
          <h2 className="text-2xl font-semibold">Gestion del Cliente</h2>
        </div>

        <TabsNav />

        {renderClienteTab()}

        {message && (
          <div
            className={`px-6 pb-6 ${message.type === 'success' ? 'text-emerald-800' : 'text-red-800'} text-sm font-semibold`}
          >
            {message.text}
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

export default Clientes;
