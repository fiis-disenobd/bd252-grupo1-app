const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Solicitud fallida (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export type HealthResponse = {
  status: string;
};

export type ReportSummary = {
  id: string;
  title: string;
  description: string;
  value: string;
  variation?: string;
};

export const api = {
  health: () => request<HealthResponse>('/health'),
  reportSummary: () => request<ReportSummary[]>('/reportes/resumen'),
  ventasResumen: () =>
    request<{ totalVentas: number; totalKilogramos: number; precioPromedioKg: number }>(
      '/reportes/ventas-dia/resumen'
    ),
  ventasDetalle: (params: URLSearchParams) =>
    request<
      Array<{
        cliente: string;
        especie: string;
        kilogramos: number;
        precioKg: number;
        descuentoPorcentaje: number;
        total: number;
      }>
    >(`/reportes/ventas-dia/detalle?${params.toString()}`),
  stockActual: (params: URLSearchParams) =>
    request<
      Array<{
        camara: string;
        especie: string;
        piezas: number;
        kilogramos: number;
        estado: string;
      }>
    >(`/reportes/stock-actual?${params.toString()}`),
  trazabilidadPieza: (pedidoIdOrCodigo: string) =>
    request<{
      codigo: string;
      especie: string;
      pesoFinalKg: number;
      fechaBeneficio: string;
      horaBeneficio: string;
      camara: string;
      comisionado: string;
      cliente: string;
      estadoReclamo: string;
    }>(`/reportes/trazabilidad/pieza?codigo=${encodeURIComponent(pedidoIdOrCodigo)}`),
  trazabilidadReclamos: (pedidoIdOrCodigo: string) =>
    request<
      Array<{
        tipoReclamo: string;
        urgencia: string;
        estado: string;
        descripcion: string;
      }>
    >(`/reportes/trazabilidad/reclamos?codigo=${encodeURIComponent(pedidoIdOrCodigo)}`),
};
