import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { ReportSummary } from '@/services/api';

const fallbackSummary: ReportSummary[] = [
  {
    id: 'ventas-dia',
    title: 'Ventas del día',
    description: 'Pedidos liquidados',
    value: '128 operaciones',
    variation: '+8.2% vs ayer',
  },
  {
    id: 'stock-ocupacion',
    title: 'Stock disponible',
    description: 'Cámaras activas',
    value: '92% ocupación',
    variation: '-1.1% vs ayer',
  },
  {
    id: 'trazabilidad',
    title: 'Trazabilidad completada',
    description: 'Lotes validados',
    value: '100% lotes',
    variation: '0 incidencias',
  },
];

export const useReportSummary = () => {
  const [summary, setSummary] = useState<ReportSummary[]>(fallbackSummary);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.reportSummary();
        if (mounted) {
          setSummary(data);
        }
      } catch (err) {
        if (mounted) {
          setError((err as Error).message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { summary, loading, error };
};

export const useHealthStatus = () => {
  const [status, setStatus] = useState<'ok' | 'offline'>('offline');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.health();
        if (mounted && data.status === 'ok') {
          setStatus('ok');
        }
      } catch {
        if (mounted) {
          setStatus('offline');
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return status;
};
