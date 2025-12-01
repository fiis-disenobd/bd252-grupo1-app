import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
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
    @Get('cliente/:id')
    async findByClient(@Param('id') id: string) {
        return this.ventasService.findByClient(Number(id));
    }
    @Patch(':id/estado')
    async updateStatus(@Param('id') id: string, @Body('estado') estado: string) {
        return this.ventasService.updateStatus(id, estado);
    }
}
