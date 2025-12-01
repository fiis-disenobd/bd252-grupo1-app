import { useEffect, useState } from 'react';
import { api } from '@/services/api';

export type TrazabilidadDetalle = {
  codigo: string;
  especie: string;
  pesoFinalKg: number;
  fechaBeneficio: string;
  horaBeneficio: string;
  camara: string;
  comisionado: string;
  cliente: string;
  estadoReclamo: string;
};

export type ReclamoItem = {
  pedidoId?: number;
  tipoReclamo: string;
  urgencia: string;
  estado: string;
  descripcion: string;
};

export const useTrazabilidad = (codigo: string) => {
  const [detalle, setDetalle] = useState<TrazabilidadDetalle | null>(null);
  const [detalleLista, setDetalleLista] = useState<TrazabilidadDetalle[]>([]);
  const [reclamos, setReclamos] = useState<ReclamoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      // limpiar para evitar que quede el último detalle mostrado
      setDetalle(null);
      if (!codigo) {
        setReclamos([]);
      }
      try {
        if (codigo) {
          const [pieza, reclamosResp] = await Promise.all([
            api.trazabilidadPieza(codigo),
            api.trazabilidadReclamos(codigo)
          ]);
          if (mounted) {
            setDetalle(pieza);
            setDetalleLista(pieza ? [pieza] : []);
            setReclamos(reclamosResp);
          }
        } else {
          const [piezas, reclamosResp] = await Promise.all([
            api.trazabilidadPiezas(),
            api.trazabilidadReclamosTodos()
          ]);
          if (mounted) {
            setDetalle(null);
            setDetalleLista(piezas);
            setReclamos(reclamosResp);
          }
        }
      } catch (err) {
        if (mounted) {
          setError((err as Error).message);
          setDetalle(null);
          setDetalleLista([]);
          setReclamos([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [codigo]);

  return { detalle, detalleLista, reclamos, loading, error };
};
