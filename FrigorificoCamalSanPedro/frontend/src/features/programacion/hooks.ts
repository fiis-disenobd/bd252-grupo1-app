import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { ProgramacionResumen, ProgramacionItem, EjecucionItem } from '@/services/api';

export const useProgramacionResumen = (params: URLSearchParams) => {
  const [data, setData] = useState<ProgramacionResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.programacionResumen(params);
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

export const useProgramaciones = (params: URLSearchParams) => {
  const [rows, setRows] = useState<ProgramacionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.programaciones(params);
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

export const useEjecucionesProgramacion = (params: URLSearchParams) => {
  const [rows, setRows] = useState<EjecucionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.programacionEjecuciones(params);
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
