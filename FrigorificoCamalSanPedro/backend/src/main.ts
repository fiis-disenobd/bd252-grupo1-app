process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { createNestServer } from './server';
import * as express from 'express';

async function bootstrap() {
  const server = express();
  const app = await createNestServer(server);
  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
