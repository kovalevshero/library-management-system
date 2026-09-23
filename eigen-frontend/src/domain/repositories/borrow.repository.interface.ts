import { BorrowRecord } from '../entities/borrow-record.entity';

export interface BorrowBookParameters {
  memberCode: string;
  bookCode: string;
}

export interface ReturnBookParameters {
  memberCode: string;
  bookCode: string;
}

export interface GetBorrowHistoryParameters {
  page?: number;
  limit?: number;
}

export interface PaginatedBorrowHistory {
  records: BorrowRecord[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface IBorrowRepository {
  borrowBook(parameters: BorrowBookParameters): Promise<BorrowRecord>;
  returnBook(parameters: ReturnBookParameters): Promise<BorrowRecord>;
  getActiveLoansByMember(memberCode: string): Promise<BorrowRecord[]>;
  getBorrowHistory(parameters?: GetBorrowHistoryParameters): Promise<PaginatedBorrowHistory>;
}
