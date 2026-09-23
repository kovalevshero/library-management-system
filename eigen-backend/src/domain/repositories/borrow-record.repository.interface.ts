import { BorrowRecord } from '../entities/borrow-record.entity';

export interface FindAllBorrowRecordsParams {
  page?: number;
  limit?: number;
}

export interface FindAllBorrowRecordsResult {
  records: BorrowRecord[];
  total: number;
}

export interface IBorrowRecordRepository {
  findActiveLoan(
    memberCode: string,
    bookCode: string,
  ): Promise<BorrowRecord | null>;
  findActiveLoansByMember(memberCode: string): Promise<BorrowRecord[]>;
  findById(id: string): Promise<BorrowRecord | null>;
  save(record: BorrowRecord): Promise<BorrowRecord>;
  findAll(params?: FindAllBorrowRecordsParams): Promise<FindAllBorrowRecordsResult>;
}

export const BORROW_RECORD_REPOSITORY = Symbol('IBorrowRecordRepository');
