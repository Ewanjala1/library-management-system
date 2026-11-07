import { Module } from '@nestjs/common';
import { PrismaService } from '../../api/src/prisma/prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
