import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const dataSource = app.get(DataSource);

  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    await dataSource.query('SELECT 1');
    const options = dataSource.options as Partial<PostgresConnectionOptions>;
    console.log(
      `Conexion a Postgres lista (${options.host ?? ''}:${options.port ?? ''}/${options.database ?? ''})`
    );
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    throw error;
  }

  app.enableCors();
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
