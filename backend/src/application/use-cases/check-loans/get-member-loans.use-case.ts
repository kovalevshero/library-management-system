import { Inject, Injectable } from '@nestjs/common';
import {
  BORROW_RECORD_REPOSITORY,
  IBorrowRecordRepository,
} from '../../../domain/repositories/borrow-record.repository.interface';
import { BorrowRecord } from '../../../domain/entities/borrow-record.entity';

@Injectable()
export class GetMemberLoansUseCase {
  constructor(
    @Inject(BORROW_RECORD_REPOSITORY)
    private readonly borrowRecordRepository: IBorrowRecordRepository,
  ) {}

  async execute(memberCode: string): Promise<BorrowRecord[]> {
    return this.borrowRecordRepository.findActiveLoansByMember(memberCode);
  }
}
