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
  try {
    console.log(`📥 ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'} - Auth: ${req.headers.authorization ? 'present' : 'missing'}`);

    // 🔥 CORS headers manuali per Vercel
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept');

    // ✅ Gestisci preflight OPTIONS PRIMA di NestJS
    if (req.method === 'OPTIONS') {
      console.log('✅ OPTIONS preflight - returning 200 with CORS headers');
      res.status(200).end();
      return;
    }

    // ✅ Verifica variabili d'ambiente critiche
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('❌ Missing required env vars:', {
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
        DATABASE_URL: !!process.env.DATABASE_URL,
      });
      res.status(500).json({ 
        error: 'Server configuration error',
        message: 'Missing required environment variables'
      });
      return;
    }

    const app = await bootstrap();
    return app(req, res);
  } catch (error) {
    console.error('❌ Handler error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
