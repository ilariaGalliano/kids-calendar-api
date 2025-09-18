import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

// ATTENZIONE: importa sempre QUESTO PrismaService come TOKEN DI DI
import { PrismaService as PrismaToken } from '../prisma/prisma.service';

// Implementazione reale
import { PrismaService as RealPrisma } from '../prisma/prisma.service';
// Implementazione mock
import { MockDbService } from '../mock/mock-db.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PrismaToken,                              // <--- unico token usato ovunque
      useFactory: (cfg: ConfigService) => {
        const useMock = cfg.get('USE_MOCK') === '1';
        return useMock ? new MockDbService() : new RealPrisma();
      },
      inject: [ConfigService],
    },
  ],
  exports: [PrismaToken],                                // <--- esportalo
})
export class DatabaseModule {}
