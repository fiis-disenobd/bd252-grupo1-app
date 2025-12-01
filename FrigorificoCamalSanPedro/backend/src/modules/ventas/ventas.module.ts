import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentasController } from './ventas.controller';
import { VentasService } from './ventas.service';
import { ArangoModule } from '../arango/arango.module';

@Module({
    imports: [
        ArangoModule,
        TypeOrmModule.forFeature([]) // We can use DataSource directly if no entities are defined yet
    ],
    controllers: [VentasController],
    providers: [VentasService],
})
export class VentasModule { }
