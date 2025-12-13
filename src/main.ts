import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverlessExpress from '@vendia/serverless-express';

let cachedServer;

async function bootstrap() {
  if (!cachedServer) {
    const app = express();

    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(app),
    );

    nestApp.enableCors();
    await nestApp.init();

    cachedServer = serverlessExpress({ app });
  }

  return cachedServer;
}

export const handler = async (event, context) => {
  const server = await bootstrap();
  return server(event, context);
};
