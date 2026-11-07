import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BooksController, GenresController, UsersController } from './library.controller';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AppController, BooksController, GenresController, UsersController],
})
export class AppModule {}
