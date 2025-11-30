import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesModule } from './modules/reportes/reportes.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      database: process.env.POSTGRES_DB || 'FrigorificoCamalSanPedro_DB',
      schema: process.env.POSTGRES_SCHEMA || 'ventas',
      ssl:
        process.env.POSTGRES_SSL === 'true'
          ? { rejectUnauthorized: false }
          : undefined,
      extra:
        process.env.POSTGRES_SSL === 'true'
          ? { ssl: { rejectUnauthorized: false } }
          : undefined,
      autoLoadEntities: true,
      synchronize: false
    }),
    ReportesModule
  ],
  controllers: [AppController]
})
export class AppModule {}
