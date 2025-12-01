import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportesService } from './reportes.service';
import { VentasDiaQueryDto } from './dto/ventas-dia-query.dto';
import { StockQueryDto } from './dto/stock-query.dto';
import { TrazabilidadQueryDto } from './dto/trazabilidad-query.dto';
import { TransporteQueryDto } from './dto/transporte-query.dto';
import { TopClientesQueryDto } from './dto/top-clientes-query.dto';
import { ProgramacionQueryDto } from './dto/programacion-query.dto';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('resumen-mock')
  resumenMock() {
    return this.reportesService.getResumenMock();
  }

  @Get('ventas-dia/resumen')
  resumen() {
    return this.reportesService.resumenVentasDia();
  }

  @Get('transporte/resumen')
  resumenTransporte(@Query() query: TransporteQueryDto) {
    return this.reportesService.resumenTransporte(query);
  }

  @Get('transporte/detalle')
  detalleTransporte(@Query() query: TransporteQueryDto) {
    return this.reportesService.detalleTransporte(query);
  }

  @Get('top-clientes/resumen')
  resumenTopClientes(@Query() query: TopClientesQueryDto) {
    return this.reportesService.resumenTopClientes(query);
  }

  @Get('top-clientes/detalle')
  detalleTopClientes(@Query() query: TopClientesQueryDto) {
    return this.reportesService.detalleTopClientes(query);
  }

  @Get('programacion/resumen')
  resumenProgramacion(@Query() query: ProgramacionQueryDto) {
    return this.reportesService.resumenProgramacion(query);
  }

  @Get('programacion/lista')
  listaProgramacion(@Query() query: ProgramacionQueryDto) {
    return this.reportesService.listaProgramaciones(query);
  }

  @Get('programacion/ejecuciones')
  ejecucionesProgramacion(@Query() query: ProgramacionQueryDto) {
    return this.reportesService.ejecucionesRecientes(query);
  }

  @Get('ventas-dia/detalle')
  detalle(@Query() query: VentasDiaQueryDto) {
    return this.reportesService.detalleVentasDia(query);
  }

  @Get('ventas-dia/csv')
  async detalleCsv(@Query() query: VentasDiaQueryDto, @Res({ passthrough: true }) res: Response) {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-ventas-dia.csv"');
    return this.reportesService.detalleVentasDiaCsv(query);
  }

  @Get('ventas-dia/pdf')
  async detallePdf(@Query() query: VentasDiaQueryDto, @Res() res: Response) {
    const buffer = await this.reportesService.detalleVentasDiaPdf(query);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="reporte-ventas-dia.pdf"');
    res.send(buffer);
  }

  @Get('stock-actual')
  stockActual(@Query() query: StockQueryDto) {
    return this.reportesService.stockActual(query);
  }

  @Get('trazabilidad/pieza')
  trazabilidadPieza(@Query() query: TrazabilidadQueryDto) {
    return this.reportesService.trazabilidadPieza(query);
  }

  @Get('trazabilidad/reclamos')
  trazabilidadReclamos(@Query() query: TrazabilidadQueryDto) {
    return this.reportesService.trazabilidadReclamos(query);
  }
}
