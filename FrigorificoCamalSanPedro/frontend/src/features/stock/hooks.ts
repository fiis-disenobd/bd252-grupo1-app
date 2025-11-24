import { useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api';

export type StockRow = {
  camara: string;
  especie: string;
  piezas: number;
  kilogramos: number;
  estado: string;
};

export const useStockActual = (filters: { camara?: string; especie?: string }) => {
  const [rows, setRows] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (filters.camara) p.set('camara', filters.camara);
    if (filters.especie) p.set('especie', filters.especie);
    return p;
  }, [filters.camara, filters.especie]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.stockActual(params);
        if (mounted) setRows(res);
      } catch (err) {
        if (mounted) setError((err as Error).message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params.toString()]);

  return { rows, loading, error };
};
