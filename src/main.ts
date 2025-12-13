import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();
let appInitialized = false;

async function bootstrap() {
  if (!appInitialized) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.enableCors();
    await app.init();
    appInitialized = true;
  }
  return server;
}

export default async function handler(req, res) {
  const app = await bootstrap();
  app(req, res);
}