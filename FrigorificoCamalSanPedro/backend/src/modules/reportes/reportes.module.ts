import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { Venta } from './entities/venta.entity';
import { Pedido } from './entities/pedido.entity';
import { Cliente } from './entities/cliente.entity';
import { Descuento } from './entities/descuento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Venta, Pedido, Cliente, Descuento])],
  controllers: [ReportesController],
  providers: [ReportesService]
})
export class ReportesModule {}
