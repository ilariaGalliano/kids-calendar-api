import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverlessExpress from '@vendia/serverless-express';

let cachedServer: any;

async function bootstrap() {
  if (!cachedServer) {
    const expressApp = express();

    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    nestApp.enableCors();
    await nestApp.init();

    cachedServer = serverlessExpress({ app: expressApp });
  }

  return cachedServer;
}

export default async function handler(req: any, res: any) {
  const server = await bootstrap();
  return server(req, res);
}
