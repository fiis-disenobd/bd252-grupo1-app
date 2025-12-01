import React, { useEffect, useRef, useState } from "react";

type Camara = {
  id: number;
  ncamara: string;
  disponible: boolean;
  capacidad: number; // porcentaje 0..100
};

type Registro = {
  id: string;
  tipo: string;
  peso: string; // ejemplo "100kg"
  fecha: string; // dd/mm/yyyy
  comisionista: string;
};

const CAMARAS_MOCK: Camara[] = [
  { id: 1, ncamara: "C-01", disponible: true, capacidad: 50.0 },
  { id: 2, ncamara: "C-02", disponible: true, capacidad: 33 },
  { id: 3, ncamara: "C-03", disponible: true, capacidad: 0.0 },
];

const REGISTROS_MOCK: Record<number, Registro[]> = {
  1: [
    { id: "C1-R22", tipo: "Vacuno", peso: "100kg", fecha: "10/09/25", comisionista: "Juan Perez" },
    { id: "C1-R21", tipo: "Porcino", peso: "50kg", fecha: "08/09/25", comisionista: "Jose Gomez" },
    { id: "C1-R20", tipo: "Ovino", peso: "50kg", fecha: "02/09/25", comisionista: "Maria Diaz" },
    { id: "C1-R19", tipo: "Vacuno", peso: "100kg", fecha: "01/09/25", comisionista: "Pedro Gonzalez" },
  ],
  2: [{ id: "C2-R10", tipo: "Porcino", peso: "200kg", fecha: "05/09/25", comisionista: "Luis M." }],
  3: [],
};

const TOTAL_KG = 600; // espacio total por cámara

const parsePeso = (peso: string) => {
  if (!peso) return 0;
  const m = peso.match(/[\d.,]+/);
  if (!m) return 0;
  const n = m[0].replace(",", ".");
  const v = parseFloat(n);
  return Number.isNaN(v) ? 0 : v;
};

const Productos: React.FC = () => {
  const [camaras, setCamaras] = useState<Camara[]>([]);
  const [loadingCamaras, setLoadingCamaras] = useState(true);
  const [errorCamaras, setErrorCamaras] = useState<string | null>(null);

  const [selectedCamara, setSelectedCamara] = useState<Camara | null>(null);
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loadingRegistros, setLoadingRegistros] = useState(false);

  const [screen, setScreen] = useState<"home" | "camaras" | "registro" | "historial">("home");

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    camaraId: 0,
    comisionista: "",
    fecha: new Date().toISOString().slice(0, 10),
    tipo: "Vacuno",
    peso: "",
    unidad: "kg",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [showSuccess, setShowSuccess] = useState(false);
  const successTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchCamaras = async () => {
      try {
        const res = await fetch("/api/camaras");
        if (!res.ok) throw new Error("no api");
        const data = await res.json();
        setCamaras(
          data.map((d: any) => ({
            id: d.id,
            ncamara: d.ncamara,
            disponible: Number(d.capacidad) < 100,
            capacidad: Number(d.capacidad) || 0,
          }))
        );
      } catch {
        setCamaras(CAMARAS_MOCK);
        setErrorCamaras(null);
      } finally {
        setLoadingCamaras(false);
      }
    };
    fetchCamaras();
    return () => {
      if (successTimeoutRef.current) window.clearTimeout(successTimeoutRef.current);
    };
  }, []);

  const abrirDetalle = async (c: Camara) => {
    setSelectedCamara(c);
    setLoadingRegistros(true);
    setScreen("camaras");
    try {
      const res = await fetch(`/api/camaras/${c.id}/registros`);
      if (res.ok) {
        const data = await res.json();
        setRegistros(data);
      } else {
        setRegistros(REGISTROS_MOCK[c.id] ?? []);
      }
    } catch {
      setRegistros(REGISTROS_MOCK[c.id] ?? []);
    } finally {
      setLoadingRegistros(false);
    }
  };

  const cerrarDetalle = () => {
    setSelectedCamara(null);
    setRegistros([]);
  };

  const abrirCrearRegistro = (camId?: number) => {
    const id = camId ?? selectedCamara?.id ?? camaras[0]?.id ?? 0;
    setForm({
      camaraId: id,
      comisionista: "",
      fecha: new Date().toISOString().slice(0, 10),
      tipo: "Vacuno",
      peso: "",
      unidad: "kg",
    });
    setFormError(null);
    setShowCreate(true);
    setScreen("registro");
  };

  const guardarRegistro = async () => {
    setFormError(null);
    if (!form.comisionista || !form.peso) {
      setFormError("Complete comisionista y peso.");
      return;
    }
    setSaving(true);
    const camId = form.camaraId;
    const generarId = () => {
      const rnd = Math.floor(100 + Math.random() * 900);
      return `C${camId}-R${rnd}`;
    };
    const nuevo: Registro = {
      id: generarId(),
      tipo: form.tipo,
      peso: `${form.peso}${form.unidad}`,
      fecha: form.fecha.split("-").reverse().join("/"),
      comisionista: form.comisionista,
    };

    try {
      const res = await fetch(`/api/camaras/${camId}/registros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo),
      });
      if (res.ok) {
        const saved = await res.json();
        const registroGuardado = saved ?? nuevo;
        setRegistros((prev) => [registroGuardado, ...prev]);
        if (!REGISTROS_MOCK[camId]) REGISTROS_MOCK[camId] = [];
        REGISTROS_MOCK[camId].unshift(registroGuardado);
      } else {
        setRegistros((prev) => [nuevo, ...prev]);
        if (!REGISTROS_MOCK[camId]) REGISTROS_MOCK[camId] = [];
        REGISTROS_MOCK[camId].unshift(nuevo);
      }
    } catch {
      setRegistros((prev) => [nuevo, ...prev]);
      if (!REGISTROS_MOCK[camId]) REGISTROS_MOCK[camId] = [];
      REGISTROS_MOCK[camId].unshift(nuevo);
    } finally {
      const registrosParaCamara = REGISTROS_MOCK[camId] ?? registros.filter((r) => r.id.startsWith(`C${camId}-`));
      const ocupadoActual = registrosParaCamara.reduce((s, r) => s + parsePeso(r.peso), 0);
      const nuevoPorcentaje = Math.min(100, Math.round((ocupadoActual / TOTAL_KG) * 100));

      setCamaras((prev) =>
        prev.map((c) => (c.id === camId ? { ...c, capacidad: nuevoPorcentaje, disponible: nuevoPorcentaje < 100 } : c))
      );

      setSelectedCamara((prev) => (prev && prev.id === camId ? { ...prev, capacidad: nuevoPorcentaje } : prev));

      setSaving(false);
      setShowCreate(false);

      // mostrar popup de éxito y auto-ocultar
      setShowSuccess(true);
      if (successTimeoutRef.current) window.clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = window.setTimeout(() => setShowSuccess(false), 2200);

      if (screen === "registro") setScreen("camaras");
    }
  };

  const obtenerHistorial = async (): Promise<Registro[]> => {
    try {
      const res = await fetch("/api/registros");
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch {}
    return Object.values(REGISTROS_MOCK).flat();
  };

  const HistorialTable: React.FC = () => {
    const [items, setItems] = useState<Registro[] | null>(null);
    useEffect(() => {
      let mounted = true;
      (async () => {
        const data = await obtenerHistorial();
        if (mounted) setItems(data);
      })();
      return () => {
        mounted = false;
      };
    }, []);
    if (!items) return <div className="text-sm text-stone-500 p-4">Cargando historial...</div>;
    if (items.length === 0) return <div className="text-sm text-stone-500 p-4">No hay registros.</div>;

    const camLabel = (r: Registro) => {
      const m = r.id.match(/^C(\d+)/);
      if (m) {
        const idn = Number(m[1]);
        const c = camaras.find((x) => x.id === idn);
        return c ? c.ncamara : `C${idn}`;
      }
      return "";
    };

    return (
      <div className="overflow-auto max-h-80">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-100">
            <tr>
              <th className="py-2 px-3 text-left">ID</th>
              <th className="py-2 px-3 text-left">Cámara</th>
              <th className="py-2 px-3 text-left">Tipo</th>
              <th className="py-2 px-3 text-left">Peso</th>
              <th className="py-2 px-3 text-left">Fecha</th>
              <th className="py-2 px-3 text-left">Comisionista</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2 px-3">{r.id}</td>
                <td className="py-2 px-3">{camLabel(r)}</td>
                <td className="py-2 px-3">{r.tipo}</td>
                <td className="py-2 px-3">{r.peso}</td>
                <td className="py-2 px-3">{r.fecha}</td>
                <td className="py-2 px-3">{r.comisionista}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // HISTORIAL: pantalla dedicada (solo lista de informes)
  if (screen === "historial") {
    return (
      <section className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-semibold">Historial de Registros</h2>
          <button className="text-sm text-stone-500" onClick={() => setScreen("home")}>
            ← Volver
          </button>
        </div>

        <div className="mt-6 bg-white p-4 rounded border">
          <h3 className="text-xl font-semibold mb-3">Informes Registrados (todas las cámaras)</h3>
          <HistorialTable />
        </div>
      </section>
    );
  }

  // HOME
  if (screen === "home") {
    return (
      <section className="p-8">
        <h1 className="text-2xl font-semibold mb-6">Bienvenido al módulo gestión de productos.</h1>

        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          <button className="px-8 py-4 border rounded-lg shadow-sm bg-white" onClick={() => setScreen("camaras")}>
            Verificación de Espacio
          </button>

          <button className="px-8 py-4 border rounded-lg shadow-sm bg-white" onClick={() => abrirCrearRegistro()}>
            Registro de Sacrificio
          </button>
        </div>

        <div className="mt-8 flex justify-center">
          <button className="px-10 py-4 border rounded-lg shadow-sm bg-white" onClick={() => setScreen("historial")}>
            Informes Registrados
          </button>
        </div>
      </section>
    );
  }

  // VISTA CAMARAS
  return (
    <section className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-semibold text-stone-900">Cámaras frigoríficas</h2>
        <div>
          <button className="text-sm text-stone-500 mr-4" onClick={() => setScreen("home")}>
            ← Volver
          </button>
          <button className="text-sm text-stone-500" onClick={() => abrirCrearRegistro()}>
            Nuevo Registro
          </button>
        </div>
      </div>

      <div>
        <p className="text-stone-600 mt-2">Controla cámaras y registros almacenados.</p>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-stone-500">Nº Cámara · Estado · Capacidad · Ver detalles</p>
        </div>

        <div className="mt-4 overflow-x-auto bg-white rounded-2xl border border-stone-100 p-4 shadow-card">
          {loadingCamaras ? (
            <div className="text-sm text-stone-500">Cargando cámaras...</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-stone-600">
                  <th className="py-2 px-3">Nº Cámara</th>
                  <th className="py-2 px-3">Estado</th>
                  <th className="py-2 px-3">Capacidad</th>
                  <th className="py-2 px-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {camaras.map((c) => (
                  <tr key={c.id} className="border-t last:border-b">
                    <td className="py-3 px-3">{c.ncamara}</td>
                    <td className="py-3 px-3">
                      <span className={c.disponible ? "text-green-600" : "text-rose-600"}>
                        {c.disponible ? "Disponible" : "Lleno"}
                      </span>
                    </td>
                    <td className="py-3 px-3">{Math.round(c.capacidad)}%</td>
                    <td className="py-3 px-3">
                      <button
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-primary text-white text-xs"
                        onClick={() => abrirDetalle(c)}
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal detalle cámara */}
      {selectedCamara && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl bg-white rounded-lg border p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <h3 className="text-3xl font-bold">CAMARA {selectedCamara.ncamara.replace(/\D/g, "") || selectedCamara.ncamara}</h3>
              <button onClick={cerrarDetalle} className="text-stone-600 hover:text-stone-800">
                Cerrar ✕
              </button>
            </div>

            <div className="mt-4 flex gap-4 items-center">
              <div className="border rounded px-3 py-2 text-sm">Espacio total: <strong>{TOTAL_KG} kg</strong></div>

              <div className="border rounded px-3 py-2 text-sm">
                Espacio ocupado:
                <strong>
                  {" "}
                  {registros.length > 0 ? registros.reduce((s, r) => s + parsePeso(r.peso), 0) : Math.round((selectedCamara.capacidad / 100) * TOTAL_KG)} kg
                </strong>
                <div className="text-xs text-stone-500">
                  ({Math.min(100, Math.round(((registros.length > 0 ? registros.reduce((s, r) => s + parsePeso(r.peso), 0) : Math.round((selectedCamara.capacidad / 100) * TOTAL_KG)) / TOTAL_KG) * 100))}% ocupado)
                </div>
              </div>

              <div className="border rounded px-3 py-2 text-sm">
                Espacio disponible:
                <strong>
                  {" "}
                  {Math.max(0, TOTAL_KG - (registros.length > 0 ? registros.reduce((s, r) => s + parsePeso(r.peso), 0) : Math.round((selectedCamara.capacidad / 100) * TOTAL_KG)))} kg
                </strong>
              </div>

              <div className="px-3 py-1 rounded-full text-sm font-semibold ml-2">
                {(() => {
                  const ocupado = registros.length > 0 ? registros.reduce((s, r) => s + parsePeso(r.peso), 0) : Math.round((selectedCamara.capacidad / 100) * TOTAL_KG);
                  const pct = Math.min(100, Math.round((ocupado / TOTAL_KG) * 100));
                  return pct >= 100 ? (
                    <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2 rounded">LLENO</span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 rounded">{pct}% usado</span>
                  );
                })()}
              </div>
            </div>

            <p className="text-stone-600 mt-4">Lista de productos almacenados</p>

            <div className="mt-3 max-h-56 overflow-auto border rounded">
              {loadingRegistros ? (
                <div className="p-4 text-sm text-stone-500">Cargando registros...</div>
              ) : registros.length === 0 ? (
                <div className="p-4 text-sm text-stone-500">No hay registros en esta cámara.</div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="bg-stone-100">
                    <tr>
                      <th className="py-2 px-3 text-left">REGISTROS</th>
                      <th className="py-2 px-3 text-left">TIPO DE CARNE</th>
                      <th className="py-2 px-3 text-left">PESO</th>
                      <th className="py-2 px-3 text-left">FECHA DE INGRESO</th>
                      <th className="py-2 px-3 text-left">COMISIONISTA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registros.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="py-2 px-3">{r.id}</td>
                        <td className="py-2 px-3">{r.tipo}</td>
                        <td className="py-2 px-3">{r.peso}</td>
                        <td className="py-2 px-3">{r.fecha}</td>
                        <td className="py-2 px-3">{r.comisionista}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button className="px-4 py-2 border rounded text-sm" onClick={() => abrirCrearRegistro(selectedCamara?.id)}>
                Crear nuevo Registro
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded text-sm" onClick={cerrarDetalle}>
                Atrás
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Registro */}
      {showCreate && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl bg-white rounded-lg border p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">REGISTRO · {selectedCamara ? `${selectedCamara.ncamara}` : `C${form.camaraId}`}</h3>
              <button
                onClick={() => {
                  setShowCreate(false);
                  if (screen !== "home") setScreen("camaras");
                }}
                className="text-stone-600"
              >
                Cerrar ✕
              </button>
            </div>

            <p className="mt-4">Ingrese los detalles del ganado procesado:</p>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3">
                <label className="w-32 text-sm">Camara:</label>
                <select value={form.camaraId} onChange={(e) => setForm((f) => ({ ...f, camaraId: Number(e.target.value) }))} className="border rounded px-2 py-1">
                  {camaras.map((cc) => (
                    <option key={cc.id} value={cc.id}>
                      {cc.ncamara}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="w-32 text-sm">Comisionista:</label>
                <input className="flex-1 border rounded px-2 py-1" value={form.comisionista} onChange={(e) => setForm((f) => ({ ...f, comisionista: e.target.value }))} />
              </div>

              <div className="flex items-center gap-3">
                <label className="w-32 text-sm">Fecha de Ingreso:</label>
                <input type="date" className="border rounded px-2 py-1" value={form.fecha} onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))} />
              </div>

              <div className="flex items-center gap-3">
                <label className="w-32 text-sm">Tipo de Carne:</label>
                <select value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))} className="border rounded px-2 py-1">
                  <option>Vacuno</option>
                  <option>Porcino</option>
                  <option>Ovino</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="w-32 text-sm">Peso:</label>
                <input type="number" className="w-32 border rounded px-2 py-1" value={form.peso} onChange={(e) => setForm((f) => ({ ...f, peso: e.target.value }))} />
                <select value={form.unidad} onChange={(e) => setForm((f) => ({ ...f, unidad: e.target.value }))} className="border rounded px-2 py-1">
                  <option>kg</option>
                </select>
              </div>

              {formError && <div className="text-red-600 text-sm">{formError}</div>}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => {
                  setShowCreate(false);
                  if (screen !== "home") setScreen("camaras");
                }}
              >
                CANCELAR
              </button>
              <div>
                <button className="px-4 py-2 bg-primary text-white rounded" onClick={guardarRegistro} disabled={saving}>
                  {saving ? "Guardando..." : "GUARDAR"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup éxito */}
      {showSuccess && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center w-full max-w-sm">
            <p className="text-lg font-semibold">Ingresado correctamente</p>
            <button
              className="mt-4 px-4 py-2 bg-primary text-white rounded"
              onClick={() => {
                setShowSuccess(false);
                if (successTimeoutRef.current) {
                  window.clearTimeout(successTimeoutRef.current);
                  successTimeoutRef.current = null;
                }
              }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Productos;
