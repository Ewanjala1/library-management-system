import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

export interface FindBooksQuery {
  genreId?: number | string;
  search?: string;
  page?: number | string;
  limit?: number | string;
}

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto) {
    const genre = await this.prisma.genre.findUnique({
      where: { id: createBookDto.genreId },
    });
    if (!genre) {
      throw new BadRequestException(`Genre with ID ${createBookDto.genreId} does not exist`);
    }

    const existingIsbn = await this.prisma.book.findUnique({
      where: { isbn: createBookDto.isbn },
    });
    if (existingIsbn) {
      throw new ConflictException(`Book with ISBN "${createBookDto.isbn}" already exists`);
    }

    const { totalCopies, ...rest } = createBookDto;
    return this.prisma.book.create({
      data: {
        ...rest,
        totalCopies,
        copiesAvailable: totalCopies,
      },
      include: { genre: true },
    });
  }

  async findAll(query: FindBooksQuery = {}) {
    const where: Prisma.BookWhereInput = {};

    if (query.genreId !== undefined && query.genreId !== null && query.genreId !== '') {
      where.genreId = Number(query.genreId);
    }

    if (query.search && query.search.trim() !== '') {
      const searchTerm = query.search.trim();
      where.OR = [
        { title: { contains: searchTerm } },
        { author: { contains: searchTerm } },
      ];
    }

    let skip: number | undefined = undefined;
    let take: number | undefined = undefined;

    if (query.page !== undefined || query.limit !== undefined) {
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.max(1, Number(query.limit) || 10);
      skip = (page - 1) * limit;
      take = limit;
    }

    return this.prisma.book.findMany({
      where,
      skip,
      take,
      include: { genre: true },
      orderBy: { title: 'asc' },
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        genre: true,
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    await this.findOne(id);

    if (updateBookDto.genreId) {
      const genre = await this.prisma.genre.findUnique({
        where: { id: updateBookDto.genreId },
      });
      if (!genre) {
        throw new BadRequestException(`Genre with ID ${updateBookDto.genreId} does not exist`);
      }
    }

    if (updateBookDto.isbn) {
      const existing = await this.prisma.book.findUnique({
        where: { isbn: updateBookDto.isbn },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Book with ISBN "${updateBookDto.isbn}" already exists`);
      }
    }

    return this.prisma.book.update({
      where: { id },
      data: updateBookDto,
      include: { genre: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.book.delete({
      where: { id },
    });
  }
}
