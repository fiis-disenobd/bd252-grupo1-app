import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { ExpressAdapter } from '@nestjs/platform-express';
import { INestApplication } from '@nestjs/common';
import * as express from 'express';

export async function createNestServer(expressInstance: express.Express): Promise<INestApplication> {
    const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressInstance),
    );

    const dataSource = app.get(DataSource);

    try {
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
        }
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        throw error;
    }

    app.enableCors();
    app.setGlobalPrefix('api');
    return app.init();
}
