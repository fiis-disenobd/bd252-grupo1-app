import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { TopClientesDetalle, TopClientesResumen } from '@/services/api';

export const useTopClientesResumen = (params: URLSearchParams) => {
  const [data, setData] = useState<TopClientesResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.topClientesResumen(params);
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

export const useTopClientesDetalle = (params: URLSearchParams) => {
  const [rows, setRows] = useState<TopClientesDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.topClientesDetalle(params);
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
