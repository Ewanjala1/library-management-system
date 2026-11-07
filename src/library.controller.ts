import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from '../api/src/prisma/prisma.service';

@Controller('books')
export class BooksController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getBooks() {
    return this.prisma.book.findMany({
      include: { genre: true },
      orderBy: { title: 'asc' },
    });
  }

  @Get(':id')
  getBookById(@Param('id', ParseIntPipe) id: number) {
    return this.prisma.book.findUnique({
      where: { id },
      include: { genre: true, reviews: { include: { user: true } } },
    });
  }
}

@Controller('genres')
export class GenresController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getGenres() {
    return this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });
  }

  @Get(':id')
  getGenreById(@Param('id', ParseIntPipe) id: number) {
    return this.prisma.genre.findUnique({
      where: { id },
      include: {
        books: {
          include: { genre: true },
          orderBy: { title: 'asc' },
        },
      },
    });
  }
}

@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getUsers() {
    return this.prisma.user.findMany({
      orderBy: { name: 'asc' },
      include: { reviews: { include: { book: true } } },
    });
  }

  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { reviews: { include: { book: true } } },
    });
  }
}
