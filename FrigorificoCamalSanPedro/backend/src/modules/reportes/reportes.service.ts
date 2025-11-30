import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { VentasDiaQueryDto } from './dto/ventas-dia-query.dto';
import { StockQueryDto } from './dto/stock-query.dto';
import { TrazabilidadQueryDto } from './dto/trazabilidad-query.dto';
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
