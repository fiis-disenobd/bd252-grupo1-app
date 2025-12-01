import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { VentasDiaQueryDto } from './dto/ventas-dia-query.dto';
import { StockQueryDto } from './dto/stock-query.dto';
import { TrazabilidadQueryDto } from './dto/trazabilidad-query.dto';
import { TransporteQueryDto } from './dto/transporte-query.dto';
import { TopClientesQueryDto } from './dto/top-clientes-query.dto';
import PDFDocument = require('pdfkit');

type PdfDoc = PDFKit.PDFDocument;

type VentaDetalleRow = {
  cliente: string;
  especie: string;
  kilogramos: number;
  precioKg: number;
  descuentoPorcentaje: number;
  total: number;
};

@Injectable()
export class ReportesService {
  constructor(private readonly dataSource: DataSource) {}

  private buildTransporteFilters(filters: TransporteQueryDto) {
    const params: any[] = [];
    const clauses: string[] = [];

    if (filters.fechaInicio) {
      params.push(filters.fechaInicio);
      clauses.push(`p.fecha_pedido >= $${params.length}::date`);
    }

    if (filters.fechaFin) {
      params.push(filters.fechaFin);
      clauses.push(`p.fecha_pedido <= $${params.length}::date`);
    }

    if (filters.distrito) {
      params.push(filters.distrito);
      clauses.push(`c.cod_distrito = $${params.length}`);
    }

    if (`${filters.soloPagados}` === 'true') {
      clauses.push('EXISTS (SELECT 1 FROM ventas.venta v WHERE v.id_pedido = p.id_pedido)');
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    return { where, params };
  }

  private buildTopClientesFilters(filters: TopClientesQueryDto) {
    const params: any[] = [];
    const clauses: string[] = [];

    params.push(filters.fechaInicio ?? null);
    clauses.push(`( $1::date IS NULL OR p.fecha_pedido >= $1::date )`);

    params.push(filters.fechaFin ?? null);
    clauses.push(`( $2::date IS NULL OR p.fecha_pedido <= $2::date )`);

    params.push(filters.cliente ?? null);
    clauses.push(`( $3::text IS NULL OR c.nombre ILIKE '%' || $3 || '%' )`);

    const antiguedadMin = Number(filters.antiguedadMin ?? 10);
    params.push(Number.isNaN(antiguedadMin) ? 10 : antiguedadMin);

    const where = clauses.length ? `WHERE p.estado_pago = 'PAGADO' AND ${clauses.join(' AND ')}` : "WHERE p.estado_pago = 'PAGADO'";
    return { where, params, antiguedadParamIndex: params.length };
  }

  async resumenTransporte(filters: TransporteQueryDto) {
    const { where, params } = this.buildTransporteFilters(filters);

    const [row] = await this.dataSource.query(
      `
      WITH viajes AS (
        SELECT
          p.id_pedido,
          p.fecha_pedido,
          p.hora_pedido,
          e.fecha_entrega,
          e.hora_entrega,
          c.nombre       AS cliente,
          c.cod_distrito AS distrito,
          p.peso_kg,
          e.estado_entrega,
          EXTRACT(
            EPOCH FROM (
              (e.fecha_entrega + e.hora_entrega) -
              (p.fecha_pedido  + p.hora_pedido)
            )
          ) / 60.0       AS minutos
        FROM ventas.pedido p
        JOIN ventas.entrega_pedido e
          ON e.id_pedido = p.id_pedido
        JOIN ventas.cliente c
          ON c.id_cliente = p.id_cliente
        ${where}
      )
      SELECT
        COUNT(*)                                           AS total_viajes,
        AVG(minutos)                                       AS tiempo_promedio_min,
        COUNT(*) FILTER (WHERE minutos > 90)               AS con_retraso,
        ROUND(
          100.0 * COUNT(*) FILTER (WHERE minutos > 90)
            / NULLIF(COUNT(*), 0),
          1
        )                                                  AS porcentaje_retrasos,
        COUNT(*) FILTER (WHERE estado_entrega = 'PENDIENTE') AS en_transito
      FROM viajes;
      `,
      params
    );

    return {
      totalViajes: Number(row?.total_viajes ?? 0),
      tiempoPromedioMin: Number(row?.tiempo_promedio_min ?? 0),
      conRetraso: Number(row?.con_retraso ?? 0),
      porcentajeRetrasos: Number(row?.porcentaje_retrasos ?? 0),
      enTransito: Number(row?.en_transito ?? 0)
    };
  }

  async detalleTransporte(filters: TransporteQueryDto) {
    const { where, params } = this.buildTransporteFilters(filters);

    const rows = await this.dataSource.query(
      `
      WITH viajes AS (
        SELECT
          p.id_pedido,
          p.fecha_pedido,
          p.hora_pedido,
          e.fecha_entrega,
          e.hora_entrega,
          c.nombre        AS cliente,
          c.cod_distrito  AS distrito,
          p.peso_kg,
          e.estado_entrega,
          (e.fecha_entrega + e.hora_entrega) -
          (p.fecha_pedido + p.hora_pedido)    AS duracion,
          EXTRACT(
            EPOCH FROM (
              (e.fecha_entrega + e.hora_entrega) -
              (p.fecha_pedido + p.hora_pedido)
            )
          ) / 60.0                            AS minutos
        FROM ventas.pedido p
        JOIN ventas.entrega_pedido e
          ON e.id_pedido = p.id_pedido
        JOIN ventas.cliente c
          ON c.id_cliente = p.id_cliente
        ${where}
      )
      SELECT
        fecha_pedido                         AS fecha,
        id_pedido,
        cliente,
        distrito,
        peso_kg,
        TO_CHAR(hora_pedido,   'HH24:MI')    AS salida,
        TO_CHAR(hora_entrega,  'HH24:MI')    AS llegada,
        duracion,
        estado_entrega,
        CASE
          WHEN minutos > 90 THEN (minutos - 90)::int
          ELSE 0
        END                                  AS retraso_minutos,
        minutos
      FROM viajes
      ORDER BY
        fecha_pedido,
        hora_pedido;
      `,
      params
    );

    return rows.map((row: any) => ({
      fecha: row.fecha,
      idPedido: Number(row.id_pedido ?? row.idpedido ?? 0),
      cliente: row.cliente,
      distrito: row.distrito,
      pesoKg: Number(row.peso_kg ?? 0),
      salida: row.salida,
      llegada: row.llegada,
      duracion: row.duracion,
      minutos: row.minutos === null || row.minutos === undefined ? null : Number(row.minutos),
      estadoEntrega: row.estado_entrega,
      retrasoMinutos: Number(row.retraso_minutos ?? 0)
    }));
  }

  async resumenTopClientes(filters: TopClientesQueryDto) {
    const { where, params, antiguedadParamIndex } = this.buildTopClientesFilters(filters);
    const antiguedadIdx = antiguedadParamIndex;

    const rows = await this.dataSource.query(
      `
      WITH pedidos_filtrados AS (
        SELECT
          p.*,
          c.nombre     AS nombre_cliente,
          c.fecha_alta AS fecha_alta_cliente
        FROM ventas.pedido  p
        JOIN ventas.cliente c
          ON c.id_cliente = p.id_cliente
        ${where}
      ),
      volumen_por_cliente AS (
        SELECT
          id_cliente,
          nombre_cliente,
          SUM(peso_kg)            AS volumen_kg,
          MIN(fecha_alta_cliente) AS fecha_alta
        FROM pedidos_filtrados
        GROUP BY id_cliente, nombre_cliente
      ),
      top10 AS (
        SELECT volumen_kg
        FROM volumen_por_cliente
        ORDER BY volumen_kg DESC
        LIMIT 10
      ),
      resumen AS (
        SELECT
          (SELECT COUNT(*) FROM ventas.cliente) AS total_clientes,
          (
            SELECT COUNT(*)
            FROM ventas.cliente c
            WHERE DATE_PART('year', AGE(CURRENT_DATE, c.fecha_alta)) >= $${antiguedadIdx}::int
          ) AS clientes_vip_10_anios,
          (SELECT COALESCE(SUM(volumen_kg), 0) FROM top10) AS volumen_top10_kg,
          (
            SELECT COALESCE(SUM(monto_bruto * (d.valor / 100.0)), 0)
            FROM (
              SELECT
                p.id_cliente,
                p.peso_kg * p.precio                          AS monto_bruto,
                DATE_PART('year', AGE(CURRENT_DATE, c.fecha_alta)) AS antiguedad
              FROM ventas.pedido p
              JOIN ventas.cliente c
                ON c.id_cliente = p.id_cliente
              ${where}
            ) t
            JOIN ventas.descuento d
              ON t.antiguedad >= d.antiguedad_min
             AND (d.antiguedad_max IS NULL OR t.antiguedad <= d.antiguedad_max)
          ) AS descuentos_totales_soles
      ),
      distribucion_volumen AS (
        SELECT
          CASE
            WHEN volumen_kg > 10000                THEN '>10,000 kg'
            WHEN volumen_kg BETWEEN 5000 AND 10000 THEN '5,000-10,000 kg'
            WHEN volumen_kg BETWEEN 1000 AND 5000  THEN '1,000-5,000 kg'
            WHEN volumen_kg BETWEEN 500 AND 1000   THEN '500-1,000 kg'
            ELSE '<500 kg'
          END          AS rango_volumen,
          COUNT(*)     AS cantidad_clientes
        FROM volumen_por_cliente
        GROUP BY rango_volumen
      )
      SELECT
        r.total_clientes,
        r.clientes_vip_10_anios,
        r.volumen_top10_kg,
        r.descuentos_totales_soles,
        d.rango_volumen,
        d.cantidad_clientes
      FROM resumen r
      CROSS JOIN distribucion_volumen d
      ORDER BY
        CASE d.rango_volumen
          WHEN '>10,000 kg'      THEN 1
          WHEN '5,000-10,000 kg' THEN 2
          WHEN '1,000-5,000 kg'  THEN 3
          WHEN '500-1,000 kg'    THEN 4
          ELSE 5
        END;
      `,
      params
    );

    if (!rows.length) {
      return {
        totalClientes: 0,
        clientesVip: 0,
        volumenTop10Kg: 0,
        descuentosTotalesSoles: 0,
        distribucion: []
      };
    }

    const base = rows[0];
    const distribucion = rows.map((row: any) => ({
      rangoVolumen: row.rango_volumen,
      cantidadClientes: Number(row.cantidad_clientes ?? 0)
    }));

    return {
      totalClientes: Number(base.total_clientes ?? 0),
      clientesVip: Number(base.clientes_vip_10_anios ?? 0),
      volumenTop10Kg: Number(base.volumen_top10_kg ?? 0),
      descuentosTotalesSoles: Number(base.descuentos_totales_soles ?? 0),
      distribucion
    };
  }

  async detalleTopClientes(filters: TopClientesQueryDto) {
    const { params } = this.buildTopClientesFilters(filters);
    const queryParams = [params[0] ?? null, params[1] ?? null, params[2] ?? null];

    const rows = await this.dataSource.query(
      `
      WITH base AS (
        SELECT
            c.id_cliente,
            c.nombre,
            c.fecha_alta,
            SUM(p.peso_kg)            AS volumen_kg,
            SUM(p.peso_kg * p.precio) AS monto_total,
            MIN(p.fecha_pedido)       AS primera_compra,
            MAX(p.fecha_pedido)       AS ultima_compra
        FROM ventas.cliente c
        JOIN ventas.pedido  p ON p.id_cliente = c.id_cliente
        LEFT JOIN ventas.venta   v ON v.id_pedido  = p.id_pedido
        WHERE p.estado_pago = 'PAGADO'
          AND ( $1::date IS NULL OR p.fecha_pedido >= $1::date )
          AND ( $2::date IS NULL OR p.fecha_pedido <= $2::date )
          AND ( $3::text IS NULL OR c.nombre ILIKE '%' || $3 || '%' )
        GROUP BY
            c.id_cliente,
            c.nombre,
            c.fecha_alta
      )
      SELECT
          ROW_NUMBER() OVER (ORDER BY volumen_kg DESC) AS ranking,
          nombre                                       AS cliente,
          id_cliente                                   AS ruc,
          volumen_kg,
          monto_total,
          ROUND(
            monto_total
            / GREATEST(
                1,
                (DATE_PART('year', CURRENT_DATE) - DATE_PART('year', fecha_alta) + 1) * 12
              )::numeric,
            2
          )                                            AS prom_mensual,
          FLOOR(
            (CURRENT_DATE - fecha_alta)::numeric / 365.25
          )                                            AS antiguedad_anios,
          COALESCE(d_match.valor, 0)                   AS descuento_antiguedad_pct,
          ROUND(monto_total * COALESCE(d_match.valor, 0) / 100.0, 2) AS descuento_aplicado_soles,
          ultima_compra
      FROM base
      LEFT JOIN LATERAL (
        SELECT valor
        FROM ventas.descuento d
        WHERE d.antiguedad_min <= FLOOR((CURRENT_DATE - base.fecha_alta)::numeric / 365.25)
          AND (d.antiguedad_max IS NULL OR d.antiguedad_max >= FLOOR((CURRENT_DATE - base.fecha_alta)::numeric / 365.25))
        ORDER BY d.antiguedad_min DESC
        LIMIT 1
      ) d_match ON true
      ORDER BY volumen_kg DESC
      LIMIT 5;
      `,
      queryParams
    );

    return rows.map((row: any) => ({
      ranking: Number(row.ranking ?? 0),
      cliente: row.cliente,
      ruc: `${row.ruc ?? ''}`,
      volumenKg: Number(row.volumen_kg ?? 0),
      montoTotal: Number(row.monto_total ?? 0),
      promMensual: Number(row.prom_mensual ?? 0),
      antiguedadAnios: Number(row.antiguedad_anios ?? 0),
      descuentoAntiguedadPct: Number(row.descuento_antiguedad_pct ?? 0),
      descuentoAplicadoSoles: Number(row.descuento_aplicado_soles ?? 0),
      ultimaCompra: row.ultima_compra
    }));
  }

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

  async detalleVentasDia(filters: VentasDiaQueryDto): Promise<VentaDetalleRow[]> {
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

  private escapeCsvValue(value: string | number) {
    const text = `${value ?? ''}`;
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  }

  private buildVentasDiaCsv(rows: VentaDetalleRow[]) {
    const header = ['Cliente', 'Especie', 'Kilogramos', 'Precio/kg', 'Descuento (%)', 'Total'];
    const lines = rows.map((row) =>
      [
        this.escapeCsvValue(row.cliente),
        this.escapeCsvValue(row.especie),
        this.escapeCsvValue(row.kilogramos),
        this.escapeCsvValue(row.precioKg.toFixed(2)),
        this.escapeCsvValue(row.descuentoPorcentaje),
        this.escapeCsvValue(row.total.toFixed(2))
      ].join(',')
    );

    return [header.join(','), ...lines].join('\n');
  }

  async detalleVentasDiaCsv(filters: VentasDiaQueryDto) {
    const rows = await this.detalleVentasDia(filters);
    return this.buildVentasDiaCsv(rows);
  }

  private async createPdfBuffer(build: (doc: PdfDoc) => void): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk as Buffer));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      build(doc);
      doc.end();
    });
  }

  private buildVentasDiaPdfContent(doc: PdfDoc, rows: VentaDetalleRow[]) {
    const cols = {
      cliente: { x: 40, width: 170, align: 'left' as const },
      especie: { x: 210, width: 90, align: 'left' as const },
      kilos: { x: 300, width: 60, align: 'right' as const },
      precio: { x: 370, width: 90, align: 'right' as const },
      descuento: { x: 470, width: 60, align: 'right' as const },
      total: { x: 540, width: 60, align: 'right' as const }
    };

    doc.fontSize(18).text('Reporte de Ventas del Día', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text('Detalle de ventas:', { underline: true });
    doc.moveDown(0.5);

    const drawRow = (
      values: { text: string | number; col: keyof typeof cols; font?: 'normal' | 'bold' }[],
      bold = false
    ) => {
      const startY = doc.y;
      values.forEach(({ text, col }) => {
        const { x, width, align } = cols[col];
        doc
          .font(bold ? 'Helvetica-Bold' : 'Helvetica')
          .text(String(text), x, startY, { width, align, lineBreak: false });
      });
      doc.y = startY + doc.currentLineHeight();
    };

    drawRow(
      [
        { text: 'Cliente', col: 'cliente' },
        { text: 'Especie', col: 'especie' },
        { text: 'Kg', col: 'kilos' },
        { text: 'Precio/kg', col: 'precio' },
        { text: 'Desc. (%)', col: 'descuento' },
        { text: 'Total', col: 'total' }
      ],
      true
    );
    doc.moveTo(cols.cliente.x, doc.y + 2).lineTo(600, doc.y + 2).stroke();
    doc.moveDown(0.5);

    if (!rows.length) {
      doc.font('Helvetica').text('Sin resultados para los filtros aplicados.');
      return;
    }

    rows.forEach((row) => {
      drawRow([
        { text: row.cliente, col: 'cliente' },
        { text: row.especie, col: 'especie' },
        { text: row.kilogramos, col: 'kilos' },
        { text: `S/ ${row.precioKg.toFixed(2)}`, col: 'precio' },
        { text: `${row.descuentoPorcentaje}%`, col: 'descuento' },
        { text: `S/ ${row.total.toFixed(2)}`, col: 'total' }
      ]);
    });

    const totalVentas = rows.reduce((acc, r) => acc + r.total, 0);
    const totalKg = rows.reduce((acc, r) => acc + r.kilogramos, 0);
    doc.moveDown();

    const summaryX = cols.precio.x;
    const summaryWidth = 180;
    const labelWidth = summaryWidth * 0.5;
    const valueWidth = summaryWidth * 0.5;
    doc
      .font('Helvetica-Bold')
      .text('Totales', summaryX, doc.y, { width: summaryWidth, align: 'left' })
      .moveDown(0.3);
    doc
      .font('Helvetica')
      .text('Kilogramos:', summaryX, doc.y, { width: labelWidth, align: 'left' });
    doc
      .font('Helvetica-Bold')
      .text(`${totalKg} kg`, summaryX + labelWidth, doc.y - doc.currentLineHeight(), {
        width: valueWidth,
        align: 'right'
      })
      .moveDown(0.2);
    doc
      .font('Helvetica')
      .text('Ventas:', summaryX, doc.y, { width: labelWidth, align: 'left' });
    doc
      .font('Helvetica-Bold')
      .text(`S/ ${totalVentas.toFixed(2)}`, summaryX + labelWidth, doc.y - doc.currentLineHeight(), {
        width: valueWidth,
        align: 'right'
      });
  }

  async detalleVentasDiaPdf(filters: VentasDiaQueryDto) {
    const rows = await this.detalleVentasDia(filters);
    return this.createPdfBuffer((doc) => this.buildVentasDiaPdfContent(doc, rows));
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
