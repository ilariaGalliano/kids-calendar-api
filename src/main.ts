import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  // bodyParser: false disabilita il body parser di default (100kb) per usare il nostro
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // JSON body limit — avatar server-side stripping handles old clients sending base64
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ limit: '2mb', extended: true }));

  // Configura CORS - whitelist esplicita dei domini autorizzati
  app.enableCors({
    origin: [
      'https://calendar-kids.vercel.app',
      'http://localhost:4200'
    ],
    credentials: true,
  });

  await app.listen(3000);
}

bootstrap();
