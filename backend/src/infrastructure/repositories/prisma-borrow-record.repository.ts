import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  FindAllBorrowRecordsParams,
  FindAllBorrowRecordsResult,
  IBorrowRecordRepository,
} from '../../domain/repositories/borrow-record.repository.interface';
import {
  BorrowRecord,
  BorrowRecordStatus,
} from '../../domain/entities/borrow-record.entity';

@Injectable()
export class PrismaBorrowRecordRepository implements IBorrowRecordRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveLoan(
    memberCode: string,
    bookCode: string,
  ): Promise<BorrowRecord | null> {
    const raw = await this.prisma.borrowRecord.findFirst({
      where: {
        memberCode,
        bookCode,
        status: 'BORROWED',
      },
    });
    if (!raw) return null;
    return this.toDomain(raw);
  }

  async findActiveLoansByMember(memberCode: string): Promise<BorrowRecord[]> {
    const records = await this.prisma.borrowRecord.findMany({
      where: {
        memberCode,
        status: 'BORROWED',
      },
      orderBy: { borrowedAt: 'desc' },
    });
    return records.map((record) => this.toDomain(record));
  }

  async findById(id: string): Promise<BorrowRecord | null> {
    const raw = await this.prisma.borrowRecord.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return this.toDomain(raw);
  }

  async save(record: BorrowRecord): Promise<BorrowRecord> {
    const saved = await this.prisma.borrowRecord.upsert({
      where: { id: record.id },
      update: {
        returnedAt: record.returnedAt,
        status: record.status,
      },
      create: {
        id: record.id,
        memberCode: record.memberCode,
        bookCode: record.bookCode,
        borrowedAt: record.borrowedAt,
        returnedAt: record.returnedAt,
        status: record.status,
      },
    });
    return this.toDomain(saved);
  }

    async findAll(
    params?: FindAllBorrowRecordsParams,
  ): Promise<FindAllBorrowRecordsResult> {
    const page = Math.max(1, params?.page ?? 1);
    const limit = Math.max(1, params?.limit ?? 10);
    const skip = (page - 1) * limit;

    const [rawRecords, total] = await Promise.all([
      this.prisma.borrowRecord.findMany({
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.borrowRecord.count(),
    ]);

    return {
      records: rawRecords.map((record) => this.toDomain(record)),
      total,
    };
  }

  private toDomain(raw: {
    id: string;
    memberCode: string;
    bookCode: string;
    borrowedAt: Date;
    returnedAt: Date | null;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): BorrowRecord {
    return new BorrowRecord({
      id: raw.id,
      memberCode: raw.memberCode,
      bookCode: raw.bookCode,
      borrowedAt: raw.borrowedAt,
      returnedAt: raw.returnedAt,
      status: raw.status as BorrowRecordStatus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
