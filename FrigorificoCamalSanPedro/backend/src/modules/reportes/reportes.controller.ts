import { Controller, Get, Query } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { VentasDiaQueryDto } from './dto/ventas-dia-query.dto';
import { StockQueryDto } from './dto/stock-query.dto';
import { TrazabilidadQueryDto } from './dto/trazabilidad-query.dto';

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

  @Get('ventas-dia/detalle')
  detalle(@Query() query: VentasDiaQueryDto) {
    return this.reportesService.detalleVentasDia(query);
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
