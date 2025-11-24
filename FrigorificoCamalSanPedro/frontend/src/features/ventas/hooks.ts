import { useEffect, useState } from 'react';
import { api } from '@/services/api';

export type VentasResumen = {
  totalVentas: number;
  totalKilogramos: number;
  precioPromedioKg: number;
};

export type VentasDetalle = {
  cliente: string;
  especie: string;
  kilogramos: number;
  precioKg: number;
  descuentoPorcentaje: number;
  total: number;
};

export const useVentasResumen = () => {
  const [data, setData] = useState<VentasResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.ventasResumen();
        if (mounted) setData(res);
      } catch (err) {
        if (mounted) setError((err as Error).message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
};

export const useVentasDetalle = (params: URLSearchParams) => {
  const [rows, setRows] = useState<VentasDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.ventasDetalle(params);
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
