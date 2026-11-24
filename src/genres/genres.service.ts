import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGenreDto: CreateGenreDto) {
    const existing = await this.prisma.genre.findUnique({
      where: { name: createGenreDto.name },
    });

    if (existing) {
      throw new ConflictException(`Genre "${createGenreDto.name}" already exists`);
    }

    return this.prisma.genre.create({
      data: createGenreDto,
    });
  }

  async findAll() {
    return this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
      include: {
        books: {
          select: { id: true, title: true, author: true, isbn: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
      include: {
        books: {
          orderBy: { title: 'asc' },
        },
      },
    });

    if (!genre) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }

    return genre;
  }

  async update(id: number, updateGenreDto: UpdateGenreDto) {
    await this.findOne(id);

    if (updateGenreDto.name) {
      const existing = await this.prisma.genre.findUnique({
        where: { name: updateGenreDto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Genre "${updateGenreDto.name}" already exists`);
      }
    }

    return this.prisma.genre.update({
      where: { id },
      data: updateGenreDto,
    });
  }

  async remove(id: number) {
    const genre = await this.findOne(id);

    if (genre.books && genre.books.length > 0) {
      throw new BadRequestException('Cannot delete genre that contains books');
    }

    return this.prisma.genre.delete({
      where: { id },
    });
  }
}
