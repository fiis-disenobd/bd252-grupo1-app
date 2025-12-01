import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { TransporteDetalle, TransporteResumen } from '@/services/api';

export const useTransporteResumen = (params: URLSearchParams) => {
  const [data, setData] = useState<TransporteResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.transporteResumen(params);
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
  }, [params.toString()]);

  return { data, loading, error };
};

export const useTransporteDetalle = (params: URLSearchParams) => {
  const [rows, setRows] = useState<TransporteDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.transporteDetalle(params);
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
