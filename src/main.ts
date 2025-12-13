import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';

const server = express();
let isInitialized = false;

async function bootstrap() {
  if (!isInitialized) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
    );

    app.enableCors();
    await app.init();

    isInitialized = true;
  }
}

export default async function handler(req: Request, res: Response) {
  await bootstrap();
  server(req, res);
}
