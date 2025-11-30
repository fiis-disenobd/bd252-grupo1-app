import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root() {
    return { message: 'API FrigorificoCamalSanPedro operativa' };
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
