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
  tipoReclamo: string;
  urgencia: string;
  estado: string;
  descripcion: string;
};

export const useTrazabilidad = (codigo: string) => {
  const [detalle, setDetalle] = useState<TrazabilidadDetalle | null>(null);
  const [reclamos, setReclamos] = useState<ReclamoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!codigo) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [pieza, reclamosResp] = await Promise.all([
          api.trazabilidadPieza(codigo),
          api.trazabilidadReclamos(codigo)
        ]);
        if (mounted) {
          setDetalle(pieza);
          setReclamos(reclamosResp);
        }
      } catch (err) {
        if (mounted) {
          setError((err as Error).message);
          setDetalle(null);
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

  return { detalle, reclamos, loading, error };
};
