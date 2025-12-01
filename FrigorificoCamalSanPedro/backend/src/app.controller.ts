import { Controller, Get, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Database } from 'arangojs';
import { ARANGO_DB_CONNECTION } from './modules/arango/arango.provider';

@Controller()
export class AppController {
  constructor(
    private configService: ConfigService,
    @Inject(ARANGO_DB_CONNECTION) private readonly db: Database,
  ) { }

  @Get()
  root() {
    return { message: 'API FrigorificoCamalSanPedro operativa' };
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Get('debug')
  async debug() {
    try {
      const version = await this.db.version();
      const collections = await this.db.listCollections();

      // Check sales specifically
      let salesCount = 0;
      let sampleSales = [];
      try {
        const cursorCount = await this.db.query('RETURN LENGTH(ventas)');
        salesCount = await cursorCount.next();

        const cursorSample = await this.db.query('FOR v IN ventas LIMIT 5 RETURN v');
        sampleSales = await cursorSample.all();
      } catch (e) {
        sampleSales = ['Error querying ventas: ' + (e as any).message];
      }

      return {
        status: 'debug',
        env: {
          ARANGO_URL: this.configService.get('ARANGO_URL'),
          ARANGO_DB_NAME: this.configService.get('ARANGO_DB_NAME'),
          ARANGO_USER: this.configService.get('ARANGO_USER'),
          NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED,
        },
        connection: {
          success: true,
          version,
          collections: collections.map(c => c.name),
        },
        data: {
          salesCount,
          sampleSales
        }
      };
    } catch (error) {
      return {
        status: 'error',
        env: {
          ARANGO_URL: this.configService.get('ARANGO_URL'),
          ARANGO_DB_NAME: this.configService.get('ARANGO_DB_NAME'),
          ARANGO_USER: this.configService.get('ARANGO_USER'),
          NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED,
        },
        error: {
          message: (error as any).message,
          stack: (error as any).stack,
        }
      };
    }
  }
}
