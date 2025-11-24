import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { VentasDiaQueryDto } from './dto/ventas-dia-query.dto';
import { StockQueryDto } from './dto/stock-query.dto';
import { TrazabilidadQueryDto } from './dto/trazabilidad-query.dto';

@Injectable()
export class ReportesService {
  constructor(private readonly dataSource: DataSource) {}

  getResumenMock() {
    return [
      { id: 'ventas-dia', title: 'Ventas del día', description: 'Pedidos liquidados', value: '0', variation: '' }
    ];
  }

  async resumenVentasDia() {
    const [row] = await this.dataSource.query(
      `
      SELECT
        SUM(v.monto_total) AS total_ventas,
        SUM(p.peso_kg) AS total_kilogramos,
        ROUND(SUM(v.monto_total) / NULLIF(SUM(p.peso_kg), 0), 2) AS precio_promedio_kg
      FROM ventas.venta   v
      JOIN ventas.pedido  p ON v.id_pedido  = p.id_pedido
      JOIN ventas.cliente c ON p.id_cliente = c.id_cliente
      LEFT JOIN ventas.descuento d ON v.id_descuento = d.id_descuento;
      `
    );

    return {
      totalVentas: Number(row?.total_ventas ?? 0),
      totalKilogramos: Number(row?.total_kilogramos ?? 0),
      precioPromedioKg: Number(row?.precio_promedio_kg ?? 0)
    };
  }

  async detalleVentasDia(filters: VentasDiaQueryDto) {
    const { fecha, sede, especie, cliente } = filters;

    const rows = await this.dataSource.query(
      `
      SELECT
          c.nombre                  AS cliente,
          p.tipo_carne              AS especie,
          SUM(p.peso_kg)            AS kilogramos,
          AVG(p.precio)             AS precio_kg,
          COALESCE(MAX(d.valor), 0) AS descuento_porcentaje,
          SUM(v.monto_total)        AS total
      FROM ventas.venta   v
      JOIN ventas.pedido  p ON v.id_pedido  = p.id_pedido
      JOIN ventas.cliente c ON p.id_cliente = c.id_cliente
      LEFT JOIN ventas.descuento d ON v.id_descuento = d.id_descuento
      WHERE ( $1::date IS NULL OR p.fecha_pedido = $1::date )
        AND ( $2::text IS NULL OR c.cod_distrito = $2 )
        AND ( $3::text IS NULL OR p.tipo_carne = $3 )
        AND ( $4::text IS NULL OR c.nombre ILIKE '%' || $4 || '%' )
      GROUP BY c.nombre, p.tipo_carne
      ORDER BY total DESC;
      `,
      [fecha ?? null, sede ?? null, especie ?? null, cliente ?? null]
    );

    return rows.map((row: any) => ({
      cliente: row.cliente,
      especie: row.especie,
      kilogramos: Number(row.kilogramos ?? 0),
      precioKg: Number(row.precio_kg ?? 0),
      descuentoPorcentaje: Number(row.descuento_porcentaje ?? 0),
      total: Number(row.total ?? 0)
    }));
  }

  async stockActual(filters: StockQueryDto) {
    const { camara, especie } = filters;

    const rows = await this.dataSource.query(
      `
      SELECT
        'Cámara ' || c.id_camara AS camara,
        g.especie                AS especie,
        COUNT(*)                 AS piezas,
        SUM(s.peso_final)        AS kilogramos,
        c.estado                 AS estado_camara
      FROM producto.servicio s
      JOIN producto.ganado  g ON g.id_ganado  = s.id_ganado
      JOIN producto.camara  c ON c.id_camara  = s.id_camara
      WHERE ( $1::int IS NULL OR c.id_camara = $1::int )
        AND ( $2::text IS NULL OR g.especie = $2 )
      GROUP BY c.id_camara, g.especie, c.estado
      ORDER BY c.id_camara, g.especie;
      `,
      [camara ?? null, especie ?? null]
    );

    return rows.map((r: any) => ({
      camara: r.camara,
      especie: r.especie,
      piezas: Number(r.piezas ?? 0),
      kilogramos: Number(r.kilogramos ?? 0),
      estado: r.estado_camara
    }));
  }

  private resolvePedidoId(query: TrazabilidadQueryDto): number | null {
    if (query.pedidoId) {
      const n = Number(query.pedidoId);
      return Number.isNaN(n) ? null : n;
    }
    if (query.codigo) {
      const parts = query.codigo.split('-');
      const last = parts[parts.length - 1];
      const n = Number(last);
      return Number.isNaN(n) ? null : n;
    }
    return null;
  }

  async trazabilidadPieza(query: TrazabilidadQueryDto) {
    const pedidoId = this.resolvePedidoId(query);
    if (!pedidoId) return null;

    const [row] = await this.dataSource.query(
      `
      SELECT
          'PZ-2025-' || TO_CHAR(p.id_pedido, 'FM000000') AS codigo_pieza,
          p.tipo_carne                              AS especie,
          p.peso_kg                                 AS peso_final_kg,
          v.fecha                                   AS fecha_beneficio,
          v.hora                                    AS hora_beneficio,
          'Cámara ' || cam.id_camara                AS camara,
          cm.nombre                                 AS comisionado,
          c.nombre                                  AS cliente,
          COALESCE(
              (
                  SELECT r.estado_reclamo
                  FROM reclamos.reclamo r
                  WHERE r.id_pedido = p.id_pedido
                  ORDER BY r.id_reclamo DESC
                  LIMIT 1
              ),
              'SIN_RECLAMOS'
          ) AS estado_reclamo
      FROM ventas.pedido p
      JOIN ventas.venta    v  ON v.id_pedido  = p.id_pedido
      JOIN ventas.cliente  c  ON c.id_cliente = p.id_cliente
      JOIN producto.servicio s ON s.id_ganado = CAST(SUBSTRING(p.id_ganado FROM 2) AS INTEGER)
      JOIN producto.camara cam ON cam.id_camara = s.id_camara
      JOIN producto.comisionado cm ON cm.id_comisionado = s.id_comisionado
      WHERE p.id_pedido = $1;
      `,
      [pedidoId]
    );

    if (!row) return null;

    return {
      codigo: row.codigo_pieza,
      especie: row.especie,
      pesoFinalKg: Number(row.peso_final_kg ?? 0),
      fechaBeneficio: row.fecha_beneficio,
      horaBeneficio: row.hora_beneficio,
      camara: row.camara,
      comisionado: row.comisionado,
      cliente: row.cliente,
      estadoReclamo: row.estado_reclamo
    };
  }

  async trazabilidadReclamos(query: TrazabilidadQueryDto) {
    const pedidoId = this.resolvePedidoId(query);
    if (!pedidoId) return [];

    const rows = await this.dataSource.query(
      `
      SELECT
          r.tipo_reclamo   AS tipo_reclamo,
          r.urgencia       AS urgencia,
          r.estado_reclamo AS estado,
          r.descripcion    AS descripcion
      FROM reclamos.reclamo r
      WHERE r.id_pedido = $1
      ORDER BY r.id_reclamo;
      `,
      [pedidoId]
    );

    return rows.map((r: any) => ({
      tipoReclamo: r.tipo_reclamo,
      urgencia: r.urgencia,
      estado: r.estado,
      descripcion: r.descripcion
    }));
  }
}
