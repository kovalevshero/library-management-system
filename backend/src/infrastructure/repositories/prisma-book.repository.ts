import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IBookRepository } from '../../domain/repositories/book.repository.interface';
import { Book } from '../../domain/entities/book.entity';

@Injectable()
export class PrismaBookRepository implements IBookRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCode(code: string): Promise<Book | null> {
    const raw = await this.prisma.book.findUnique({
      where: { code },
    });
    if (!raw) return null;
    return this.toDomain(raw);
  }

  async findAll(): Promise<Book[]> {
    const records = await this.prisma.book.findMany({
      orderBy: { code: 'asc' },
    });
    return records.map((record) => this.toDomain(record));
  }

  async countActiveLoans(bookCode: string): Promise<number> {
    return this.prisma.borrowRecord.count({
      where: {
        bookCode,
        status: 'BORROWED',
      },
    });
  }

  async countActiveLoansForBooks(): Promise<Map<string, number>> {
    const counts = await this.prisma.borrowRecord.groupBy({
      by: ['bookCode'],
      where: {
        status: 'BORROWED',
      },
      _count: {
        _all: true,
      },
    });

    const resultMap = new Map<string, number>();
    for (const item of counts) {
      resultMap.set(item.bookCode, item._count._all);
    }
    return resultMap;
  }

  async save(book: Book): Promise<Book> {
    const saved = await this.prisma.book.upsert({
      where: { code: book.code },
      update: {
        title: book.title,
        author: book.author,
        stock: book.stock,
      },
      create: {
        code: book.code,
        title: book.title,
        author: book.author,
        stock: book.stock,
      },
    });
    return this.toDomain(saved);
  }

  private toDomain(raw: {
    code: string;
    title: string;
    author: string;
    stock: number;
  }): Book {
    return new Book({
      code: raw.code,
      title: raw.title,
      author: raw.author,
      stock: raw.stock,
    });
  }
}
