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
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2 | 3>(0);
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
  const [observacion, setObservacion] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [mode, setMode] = useState<'nuevo' | 'existente'>('nuevo');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

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

  const fetchLatestObservation = async (idSolicitud: number) => {
    try {
      const { data: latestRev } = await supabase
        .from('revision')
        .select('comentario, documento_enviado!inner(id_solicitud)')
        .eq('documento_enviado.id_solicitud', idSolicitud)
        .order('fecha_hora', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestRev?.comentario) {
        setObservacion(latestRev.comentario);
      }
    } catch (err) {
      console.error('Error fetching latest observation:', err);
    }
  };

  const loadDocsByCodigo = async (codigo: string) => {
    const { data, error } = await supabase.rpc('obtener_documentos_cliente', { p_codigo_cliente: codigo });
    if (error) {
      console.warn('No se pudo cargar documentos por cliente', error.message);
      return;
    }
    console.log('Documentos Cliente Data:', data);
    if (Array.isArray(data) && data.length > 0) {
      const firstWithDoc =
        data.find((item: any) => item.archivo || item.nombre_archivo) ?? data[0];

      if (firstWithDoc.id_solicitud) {
        setSolicitudId(firstWithDoc.id_solicitud);

        const { data: solData } = await supabase
          .from('solicitud_registro')
          .select('estado_actual')
          .eq('id_solicitud', firstWithDoc.id_solicitud)
          .single();

        const currentStatus = solData?.estado_actual;
        if (currentStatus) setEstadoSolicitud(currentStatus);

        const { data: tycData } = await supabase
          .from('aceptacion_tyc')
          .select('id_aceptacion')
          .eq('id_cliente', firstWithDoc.id_cliente)
          .maybeSingle();

        if (tycData) {
          setCurrentStep(3);
          return;
        }

        let docId = firstWithDoc.id_documento;
        if (!docId) {
          const { data: docData } = await supabase
            .from('documento_enviado')
            .select('id_documento')
            .eq('id_solicitud', firstWithDoc.id_solicitud)
            .order('fecha_subida', { ascending: false })
            .limit(1)
            .single();
          if (docData) docId = docData.id_documento;
        }

        if (docId) {
          const { data: revData } = await supabase
            .from('revision')
            .select('resultado, comentario')
            .eq('id_documento', docId)
            .order('fecha_hora', { ascending: false })
            .limit(1)
            .single();

          if (revData) {
            if (revData.comentario) setObservacion(revData.comentario);

            if (currentStatus === 'Conf') {
              setCurrentStep(3);
            } else if (revData.resultado === 'Observado') {
              setEstadoSolicitud('Observado');
              setMessage({ type: 'error', text: 'Tu documento ha sido observado' });
              void fetchLatestObservation(firstWithDoc.id_solicitud);
            } else if (revData.resultado === 'Aprobado') {
              setCurrentStep(2);
              setShowApprovalModal(true);
            }
          } else {
            if (firstWithDoc.observacion) setObservacion(firstWithDoc.observacion);

            if (currentStatus === 'Conf') {
              setCurrentStep(3);
            } else if (currentStatus === 'Observado' || firstWithDoc.estado_solicitud === 'Observado') {
              setEstadoSolicitud('Observado');
              setMessage({ type: 'error', text: 'Tu documento ha sido observado' });
              void fetchLatestObservation(firstWithDoc.id_solicitud);
            } else if (currentStatus === 'Cond' || currentStatus === 'Aprobado' || firstWithDoc.estado_solicitud === 'Cond') {
              setCurrentStep(2);
              setShowApprovalModal(true);
            }
          }
        }
      }

      const filePath = firstWithDoc.archivo ?? firstWithDoc.nombre_archivo;
      if (filePath) {
        const url = supabase.storage.from(bucketName).getPublicUrl(filePath).data.publicUrl;
        setLastUpload({ name: filePath, url });
        setDocStatus('EnRevision');
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

      const { data: solData } = await supabase
        .from('solicitud_registro')
        .select('estado_actual')
        .eq('id_solicitud', idSolicitud)
        .single();

      const currentStatus = solData?.estado_actual;
      if (currentStatus) setEstadoSolicitud(currentStatus);

      let clientId = first.id_cliente;
      if (!clientId && solicitudId) {
        const { data: solClient } = await supabase.from('solicitud_registro').select('id_cliente').eq('id_solicitud', solicitudId).single();
        clientId = solClient?.id_cliente;
      }

      if (clientId) {
        const { data: tycData } = await supabase
          .from('aceptacion_tyc')
          .select('id_aceptacion')
          .eq('id_cliente', clientId)
          .maybeSingle();

        if (tycData) {
          setCurrentStep(3);
          return;
        }
      }

      let docId = first.id_documento;
      if (!docId) {
        const { data: docData } = await supabase
          .from('documento_enviado')
          .select('id_documento')
          .eq('id_solicitud', idSolicitud)
          .order('fecha_subida', { ascending: false })
          .limit(1)
          .single();
        if (docData) docId = docData.id_documento;
      }

      if (docId) {
        const { data: revData } = await supabase
          .from('revision')
          .select('resultado, comentario')
          .eq('id_documento', docId)
          .order('fecha_hora', { ascending: false })
          .limit(1)
          .single();

        if (revData) {
          if (revData.comentario) setObservacion(revData.comentario);

          if (currentStatus === 'Conf') {
            setCurrentStep(3);
          } else if (revData.resultado === 'Observado') {
            setEstadoSolicitud('Observado');
            setMessage({ type: 'error', text: 'Tu documento ha sido observado.' });
            void fetchLatestObservation(idSolicitud);
          } else if (revData.resultado === 'Aprobado') {
            setCurrentStep(2);
            setShowApprovalModal(true);
          }
        } else {
          if (first.observacion) setObservacion(first.observacion);

          if (currentStatus === 'Conf') {
            setCurrentStep(3);
          } else if (currentStatus === 'Observado' || first.estado_validacion === 'Observado') {
            setEstadoSolicitud('Observado');
            setMessage({ type: 'error', text: 'Tu documento ha sido observado' });
            void fetchLatestObservation(idSolicitud);
          } else if (currentStatus === 'Cond' || currentStatus === 'Aprobado' || first.estado_validacion === 'Aprobado') {
            setCurrentStep(2);
            setShowApprovalModal(true);
          }
        }
      }

      if (filePath) {
        const url = supabase.storage.from(bucketName).getPublicUrl(filePath).data.publicUrl;
        setLastUpload({ name: filePath, url });
        setDocStatus('EnRevision');
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
      </div >

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
            type="button"
            className="px-6 py-2 rounded-full border border-stone-300 text-stone-600 font-semibold hover:bg-stone-50 transition"
            onClick={() => setMode('existente')}
          >
            Ya soy cliente
          </button>
          <button
            type="button"
            className="px-6 py-2 rounded-full border border-stone-300 text-stone-600 font-semibold hover:bg-stone-50 transition"
            onClick={() => setForm(initialState)}
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={!isValid || submitting}
            className="px-6 py-2 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Registrando...' : 'Siguiente'}
          </button>
        </div>
      </div>
    </form >
  );

  const renderDocumentacion = () => (
    <div className="px-6 py-8 flex flex-col items-center justify-center space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="text-center space-y-2">
      </div>

      {message && (
        <div
          className={`w-full max-w-md p-4 rounded-lg border ${message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-red-50 border-red-200 text-red-700'
            }`}
        >
          <p className="text-sm font-medium text-center">{message.text}</p>
        </div>
      )}

      {/* Alerta de En Revision */}
      {docStatus === 'EnRevision' && lastUpload && estadoSolicitud !== 'Aprobado' && estadoSolicitud !== 'Observado' && (
        <div className="w-full max-w-md p-4 rounded-lg border bg-blue-50 border-blue-200 text-blue-700 animate-in fade-in slide-in-from-top-2">
          <p className="text-sm font-bold mb-1">Pendiente de Aprobación</p>
          <p className="text-sm">Tu documento ha sido enviado y está siendo revisado por nuestro equipo.</p>
        </div>
      )}

      {/* Alerta de Observación */}
      {estadoSolicitud === 'Observado' && (
        <div className="w-full max-w-md p-4 rounded-lg border bg-red-50 border-red-200 text-red-700 animate-pulse">
          <p className="text-sm font-bold mb-1">Documentación Observada:</p>
          <p className="text-sm">{observacion || 'Tu documento tiene observaciones. Por favor sube uno nuevo.'}</p>
        </div>
      )}

      {/* Alerta de Aprobación */}
      {estadoSolicitud === 'Aprobado' && (
        <div className="w-full max-w-md p-4 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-700">
          <p className="text-sm font-bold mb-1">¡Documentación Aprobada!</p>
          <p className="text-sm">Tus documentos han sido validados correctamente. Puedes continuar con el proceso.</p>
        </div>
      )}

      <div className="w-full max-w-md bg-stone-50 border-2 border-dashed border-stone-300 rounded-xl p-8 text-center hover:border-primary/50 transition cursor-pointer relative group">
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => {
            if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
          }}
          accept=".pdf,.jpg,.jpeg,.png"
        />
        <div className="space-y-3 pointer-events-none">
          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto text-primary text-xl">
            {estadoSolicitud === 'Observado' ? '⚠️' : '📄'}
          </div>
          <div>
            <p className="font-semibold text-stone-700">
              {selectedFile ? selectedFile.name : estadoSolicitud === 'Observado' ? 'Sube tu documento corregido aquí' : 'Haz clic para subir o arrastra aqui'}
            </p>
            <p className="text-xs text-stone-400 mt-1">PDF, JPG o PNG (Max. 5MB)</p>
          </div>
        </div>
      </div>

      {lastUpload && (
        <div className="w-full max-w-md bg-white border border-stone-200 rounded-lg p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-stone-100 rounded flex items-center justify-center text-stone-500 text-xs">
              📎
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-stone-700 truncate">{lastUpload.name}</span>
              <span className="text-xs text-emerald-600 font-medium">Subido exitosamente</span>
            </div>
          </div>
          <button
            className="text-xs font-semibold text-primary hover:underline whitespace-nowrap ml-2"
            onClick={() => setShowPreview(true)}
          >
            Ver archivo
          </button>
        </div>
      )}

      <div className="flex gap-3 w-full max-w-md">
        {mode === 'nuevo' && (
          <button
            className="flex-1 py-3 rounded-lg border border-stone-300 text-stone-600 font-semibold hover:bg-stone-50 transition"
            onClick={() => setCurrentStep(0)}
          >
            Atras
          </button>
        )}
        <button
          className="flex-1 py-3 rounded-lg bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? 'Subiendo...' : 'Continuar'}
        </button>
      </div>
    </div>
  );

  const handleAcceptTerms = async () => {
    if (!solicitudId || !codigoCliente) return;
    setSubmitting(true);

    try {
      // 1. Get id_cliente
      const { data: clientData, error: clientError } = await supabase
        .from('cliente')
        .select('id_cliente')
        .eq('codigo_cliente', codigoCliente)
        .single();

      if (clientError || !clientData) throw new Error('No se pudo identificar al cliente.');

      // 2. Insert into aceptacion_tyc (Correct table name)
      const { error: termError } = await supabase.from('aceptacion_tyc').insert({
        id_cliente: clientData.id_cliente,
        id_tyc: 1, // Assuming 1 for current terms
        fecha_hora: new Date().toISOString()
      });

      if (termError) throw termError;

      // 3. Update solicitud status to 'Conf'
      const { error: solError } = await supabase
        .from('solicitud_registro')
        .update({ estado_actual: 'Conf' })
        .eq('id_solicitud', solicitudId);

      if (solError) throw solError;

      setMessage({ type: 'success', text: 'Te has registrado correctamente.' });
      setCurrentStep(3); // Move to confirmation step
    } catch (error: any) {
      console.error('Error accepting terms:', error);
      setMessage({ type: 'error', text: `Error al aceptar términos: ${error.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  const renderApprovalModal = () => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center space-y-4 relative overflow-hidden">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-3xl">
          ✓
        </div>
        <h3 className="text-xl font-bold text-stone-800">¡Documentación Aprobada!</h3>
        <p className="text-stone-600">
          Tus documentos han sido validados correctamente. Puedes continuar con el proceso.
        </p>
        <button
          className="w-full py-3 rounded-lg bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:brightness-110 transition"
          onClick={() => setShowApprovalModal(false)}
        >
          Continuar
        </button>
      </div>
    </div>
  );

  const renderCondiciones = () => (
    <div className="px-6 py-8 flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-right-4">
      <h3 className="text-xl font-bold text-stone-800 uppercase tracking-wide">Términos y Condiciones</h3>

      <div className="w-full max-w-2xl bg-stone-50 border border-stone-200 rounded-lg p-6 h-64 overflow-y-auto text-sm text-stone-600 leading-relaxed text-justify shadow-inner">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <br />
        <p>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="accept-terms"
          className="w-5 h-5 rounded border-stone-300 text-primary focus:ring-primary"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
        />
        <label htmlFor="accept-terms" className="text-stone-700 font-medium cursor-pointer select-none">
          Acepto los términos y condiciones
        </label>
      </div>

      <button
        className="w-full max-w-xs py-3 rounded-lg bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!termsAccepted || submitting}
        onClick={handleAcceptTerms}
      >
        {submitting ? 'Procesando...' : 'Continuar'}
      </button>
    </div>
  );

  const renderBusquedaCliente = () => (
    <div className="px-6 py-8 flex flex-col items-center justify-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="text-center space-y-2">
      </div>

      {message && (
        <div
          className={`w-full max-w-md p-4 rounded-lg border ${message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-red-50 border-red-200 text-red-700'
            }`}
        >
          <p className="text-sm font-medium text-center">{message.text}</p>
        </div>
      )}

      <div className="w-full max-w-md space-y-4">
        <label className="block">
          <span className="block text-sm font-semibold text-stone-800 mb-2">DNI / RUC</span>
          <input
            className="w-full rounded-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            placeholder="Documento registrado"
            value={existingDoc}
            onChange={(e) => setExistingDoc(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="block text-sm font-semibold text-stone-800 mb-2">Correo Electronico</span>
          <input
            type="email"
            className="w-full rounded-full border border-stone-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            placeholder="Correo registrado"
            value={existingEmail}
            onChange={(e) => setExistingEmail(e.target.value)}
          />
        </label>
        <button
          className="w-full py-3 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:brightness-110 transition disabled:opacity-50"
          onClick={handleExistingClient}
          disabled={submitting}
        >
          {submitting ? 'Validando...' : 'Ingresar'}
        </button>
        <button
          className="w-full py-2 text-sm text-stone-500 hover:text-primary transition"
          onClick={() => setMode('nuevo')}
        >
          ¿No eres cliente? Registrate aqui
        </button>
      </div>
    </div>
  );

  const renderConfirmacion = () => (
    <div className="px-6 py-12 flex flex-col items-center justify-center space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-4xl shadow-sm">
        ✓
      </div>
      <div className="text-center space-y-2 max-w-md">
        <h3 className="text-2xl font-bold text-stone-800">¡Registro Exitoso!</h3>
        <p className="text-stone-600 text-lg">
          Te has registrado correctamente.
        </p>
        <p className="text-stone-500 text-sm">
          Tu solicitud ha sido confirmada. Nos pondremos en contacto contigo pronto.
        </p>
      </div>
      <button
        className="px-8 py-3 rounded-full bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:brightness-110 transition"
        onClick={() => window.location.reload()}
      >
        Finalizar
      </button>
    </div>
  );



  return (
    <section className="space-y-8">
      <div className="rounded-2xl bg-white border border-stone-200 shadow-card overflow-hidden">
        <div className="bg-primary text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Registro de Cliente</h2>
          {mode === 'nuevo' && (
            <div className="flex items-center gap-2 text-sm font-medium bg-white/10 px-3 py-1 rounded-full">
              <span className={currentStep === 0 ? 'text-white' : 'text-white/60'}>1. Datos</span>
              <span className="text-white/40">→</span>
              <span className={currentStep === 1 ? 'text-white' : 'text-white/60'}>2. Documentacion</span>
              <span className="text-white/40">→</span>
              <span className={currentStep === 2 ? 'text-white' : 'text-white/60'}>3. Condiciones</span>
              <span className="text-white/40">→</span>
              <span className={currentStep === 3 ? 'text-white' : 'text-white/60'}>4. Confirmacion</span>
            </div>
          )}
        </div>

        <TabsNav />

        {mode === 'existente' && currentStep === 0 ? (
          renderBusquedaCliente()
        ) : currentStep === 0 ? (
          renderClienteNuevo()
        ) : currentStep === 1 ? (
          renderDocumentacion()
        ) : currentStep === 2 ? (
          renderCondiciones()
        ) : (
          renderConfirmacion()
        )}
      </div>

      {showApprovalModal && renderApprovalModal()}

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
