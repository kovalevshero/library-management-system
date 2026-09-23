import { Inject, Injectable } from '@nestjs/common';
import {
  BORROW_RECORD_REPOSITORY,
  IBorrowRecordRepository,
} from '../../../domain/repositories/borrow-record.repository.interface';
import { BorrowRecord } from '../../../domain/entities/borrow-record.entity';

export interface GetBorrowHistoryInput {
  page?: number;
  limit?: number;
}

export interface GetBorrowHistoryOutput {
  records: BorrowRecord[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

@Injectable()
export class GetBorrowHistoryUseCase {
  constructor(
    @Inject(BORROW_RECORD_REPOSITORY)
    private readonly borrowRecordRepository: IBorrowRecordRepository,
  ) {}

  async execute(input?: GetBorrowHistoryInput): Promise<GetBorrowHistoryOutput> {
    const page = Math.max(1, input?.page ?? 1);
    const limit = Math.max(1, input?.limit ?? 10);

    const { records, total } = await this.borrowRecordRepository.findAll({
      page,
      limit,
    });

    return {
      records,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    };
  }
}
