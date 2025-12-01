import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface DatosCliente {
  dni: string;
  nombre: string;
  apellidos: string;
  antiguedad_meses: number;
  telefono: string;
  correo: string;
  tipo_descuento: string;
}

interface DatosPago {
  fecha: string;
  hora: string;
  descuento: number;
  total_pagar: number;
}

const DetalleCierreVentaPage: React.FC = () => {
  const { idPedido } = useParams<{ idPedido: string }>();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState<DatosCliente | null>(null);
  const [pago, setPago] = useState<DatosPago>({
    fecha: "",
    hora: "",
    descuento: 0,
    total_pagar: 0,
  });
  const [loading, setLoading] = useState(false);
  const [registrando, setRegistrando] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!idPedido) return;
      setLoading(true);
      try {
        // TODO: cambia a tu endpoint real
        const resp = await fetch(
          `http://localhost:3001/cierre-ventas/pedido/${idPedido}`
        );
        if (resp.ok) {
          const data = await resp.json();

          // Adapta estos campos según la respuesta real de tu backend
          setCliente({
            dni: data.dni,
            nombre: data.nombre,
            apellidos: data.apellidos,
            antiguedad_meses: data.antiguedad_meses,
            telefono: data.telefono,
            correo: data.correo,
            tipo_descuento: data.tipo_descuento,
          });

          setPago({
            fecha: data.fecha || new Date().toISOString().slice(0, 10),
            hora:
              data.hora ||
              new Date().toTimeString().slice(0, 5), // HH:mm
            descuento: data.descuento || 0,
            total_pagar: data.total_pagar || 0,
          });
        }
      } catch (e) {
        console.error("Error cargando detalle", e);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [idPedido]);

  const handleRegistrarPago = async () => {
    if (!idPedido) return;
    setRegistrando(true);
    try {
      // TODO: cambia a tu endpoint real
      const resp = await fetch(
        `http://localhost:3001/cierre-ventas/registrar-pago/${idPedido}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pago),
        }
      );

      if (resp.ok) {
        const data = await resp.json();
        alert(`PAGO REGISTRADO CON ÉXITO\ncod_venta: ${data.cod_venta}`);
        // podrías navegar al historial, etc.
      } else {
        alert("Error al registrar el pago");
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión");
    } finally {
      setRegistrando(false);
    }
  };

  if (loading || !cliente) {
    return (
      <section className="h-full flex flex-col bg-stone-50">
        <div className="w-full bg-amber-800 text-white px-8 py-3 shadow">
          <h1 className="text-xl font-semibold tracking-wide text-center">
            CIERRE DE VENTAS – CERRAR VENTA
          </h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-700">Cargando datos del pedido...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="h-full flex flex-col bg-stone-50">
      <div className="w-full bg-amber-800 text-white px-8 py-3 shadow">
        <h1 className="text-xl font-semibold tracking-wide text-center">
          CIERRE DE VENTAS – CERRAR VENTA
        </h1>
      </div>

      <div className="flex-1 px-6 py-6 space-y-8">
        {/* Datos del cliente */}
        <div>
          <h2 className="font-semibold mb-3 text-stone-900">
            DATOS DEL CLIENTE
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-xs text-stone-600 mb-1">
                id_cliente / DNI
              </label>
              <input
                readOnly
                value={cliente.dni}
                className="w-full border border-stone-700 px-3 py-1 rounded-sm bg-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-600 mb-1">
                nombres
              </label>
              <input
                readOnly
                value={cliente.nombre}
                className="w-full border border-stone-700 px-3 py-1 rounded-sm bg-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-600 mb-1">
                numero telefónico
              </label>
              <input
                readOnly
                value={cliente.telefono}
                className="w-full border border-stone-700 px-3 py-1 rounded-sm bg-stone-100"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-600 mb-1">
                apellidos
              </label>
              <input
                readOnly
                value={cliente.apellidos}
                className="w-full border border-stone-700 px-3 py-1 rounded-sm bg-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-600 mb-1">
                antigüedad (meses)
              </label>
              <input
                readOnly
                value={cliente.antiguedad_meses}
                className="w-full border border-stone-700 px-3 py-1 rounded-sm bg-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-600 mb-1">
                correo electrónico
              </label>
              <input
                readOnly
                value={cliente.correo}
                className="w-full border border-stone-700 px-3 py-1 rounded-sm bg-stone-100"
              />
            </div>

            <div>
              <label className="block text-xs text-stone-600 mb-1">
                tipo de descuento
              </label>
              <input
                readOnly
                value={cliente.tipo_descuento}
                className="w-full border border-stone-700 px-3 py-1 rounded-sm bg-stone-100"
              />
            </div>
          </div>
        </div>

        {/* Datos del pago */}
        <div>
          <h2 className="font-semibold mb-3 text-stone-900">
            DATOS DEL PAGO
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs text-stone-600 mb-1">fecha</label>
              <input
                type="date"
                value={pago.fecha}
                onChange={(e) =>
                  setPago({ ...pago, fecha: e.target.value })
                }
                className="w-full border border-stone-700 px-3 py-1 rounded-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-600 mb-1">hora</label>
              <input
                type="time"
                value={pago.hora}
                onChange={(e) => setPago({ ...pago, hora: e.target.value })}
                className="w-full border border-stone-700 px-3 py-1 rounded-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-600 mb-1">
                Descuento
              </label>
              <input
                type="number"
                value={pago.descuento}
                onChange={(e) =>
                  setPago({
                    ...pago,
                    descuento: Number(e.target.value),
                  })
                }
                className="w-full border border-stone-700 px-3 py-1 rounded-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-600 mb-1">
                Total a pagar
              </label>
              <input
                type="number"
                value={pago.total_pagar}
                onChange={(e) =>
                  setPago({
                    ...pago,
                    total_pagar: Number(e.target.value),
                  })
                }
                className="w-full border border-stone-700 px-3 py-1 rounded-sm"
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-white border border-stone-900 font-semibold shadow-[0_3px_0_0_rgba(0,0,0,1)]"
          >
            REGRESAR
          </button>
          <button
            onClick={handleRegistrarPago}
            disabled={registrando}
            className="px-6 py-2 bg-amber-700 text-white border border-stone-900 font-semibold shadow-[0_3px_0_0_rgba(0,0,0,1)] disabled:opacity-60"
          >
            {registrando ? "Registrando..." : "REGISTRAR PAGO"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default DetalleCierreVentaPage;

