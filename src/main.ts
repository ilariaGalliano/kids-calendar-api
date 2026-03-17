import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configura CORS - whitelist esplicita dei domini autorizzati
  app.enableCors({
    origin: [
      'http://localhost:4200',              // Sviluppo locale
      'https://calendar-kids.vercel.app',   // Produzione
      // Aggiungi qui eventuali altri domini Vercel di preview se necessari
      // Es: 'https://calendar-kids-git-main-username.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
  await app.listen(3000);
}

bootstrap();
