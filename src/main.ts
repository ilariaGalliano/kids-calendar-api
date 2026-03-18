import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
