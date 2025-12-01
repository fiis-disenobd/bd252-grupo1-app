import { Controller, Get, Post, Body } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { Venta } from './ventas.interface';

@Controller('ventas')
export class VentasController {
    constructor(private readonly ventasService: VentasService) { }

    @Post()
    async create(@Body() venta: Venta) {
        return this.ventasService.create(venta);
    }

    @Get()
    async findAll() {
        return this.ventasService.findAll();
    }
}
