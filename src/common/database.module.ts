import { Module, Global } from '@nestjs/common';
import { PrismaClient } from '@bis/database';

@Global()
@Module({
  providers: [
    {
      provide: PrismaClient,
      useFactory: async () => {
        const prisma = new PrismaClient({
          log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        });
        await prisma.$connect();
        return prisma;
      },
    },
  ],
  exports: [PrismaClient],
})
export class DatabaseModule {}
