import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IMemberRepository } from '../../domain/repositories/member.repository.interface';
import { Member } from '../../domain/entities/member.entity';

@Injectable()
export class PrismaMemberRepository implements IMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCode(code: string): Promise<Member | null> {
    const raw = await this.prisma.member.findUnique({
      where: { code },
    });
    if (!raw) return null;
    return this.toDomain(raw);
  }

  async findAll(): Promise<Member[]> {
    const records = await this.prisma.member.findMany({
      orderBy: { code: 'asc' },
    });
    return records.map((record) => this.toDomain(record));
  }

  async countActiveLoans(memberCode: string): Promise<number> {
    return this.prisma.borrowRecord.count({
      where: {
        memberCode,
        status: 'BORROWED',
      },
    });
  }

  async countActiveLoansForMembers(): Promise<Map<string, number>> {
    const counts = await this.prisma.borrowRecord.groupBy({
      by: ['memberCode'],
      where: {
        status: 'BORROWED',
      },
      _count: {
        _all: true,
      },
    });

    const resultMap = new Map<string, number>();
    for (const item of counts) {
      resultMap.set(item.memberCode, item._count._all);
    }
    return resultMap;
  }

  async save(member: Member): Promise<Member> {
    const saved = await this.prisma.member.upsert({
      where: { code: member.code },
      update: {
        name: member.name,
        penaltyUntil: member.penaltyUntil,
      },
      create: {
        code: member.code,
        name: member.name,
        penaltyUntil: member.penaltyUntil,
      },
    });
    return this.toDomain(saved);
  }

  private toDomain(raw: {
    code: string;
    name: string;
    penaltyUntil: Date | null;
  }): Member {
    return new Member({
      code: raw.code,
      name: raw.name,
      penaltyUntil: raw.penaltyUntil,
    });
  }
}
