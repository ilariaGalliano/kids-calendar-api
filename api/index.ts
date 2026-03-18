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
      { logger: ['error', 'warn', 'log', 'debug'] },
    );

    // 🔥 CORS semplificato per Vercel serverless
    app.enableCors({
      origin: true,  // Permetti tutte le origini per debug
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    await app.init();

    server = expressApp;
  }

  return server;
}

export default async function handler(req: any, res: any) {
  console.log(`📥 ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'} - Auth: ${req.headers.authorization ? 'present' : 'missing'}`);

  // 🔥 CORS headers manuali per Vercel
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept');

  // ✅ Gestisci preflight OPTIONS PRIMA di NestJS
  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS preflight - returning 200 with CORS headers');
    res.status(200).end();
    return;
  }

  const app = await bootstrap();
  return app(req, res);
}
