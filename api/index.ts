import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let server: any;

async function bootstrap() {
  if (!server) {
    const expressApp = express();

    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    // Configura CORS per Vercel
    app.enableCors({
      origin: [
        'http://localhost:4200',              // Sviluppo locale
        'https://calendar-kids.vercel.app',   // Produzione
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    await app.init();

    server = expressApp;
  }

  return server;
}

export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  return app(req, res);
}
