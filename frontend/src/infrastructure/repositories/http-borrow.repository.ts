import { BorrowRecord } from '../../domain/entities/borrow-record.entity';
import {
  BorrowBookParameters,
  GetBorrowHistoryParameters,
  IBorrowRepository,
  PaginatedBorrowHistory,
  ReturnBookParameters,
} from '../../domain/repositories/borrow.repository.interface';
import { apiClient } from '../api/http-client';
import {
  BorrowRequestDto,
  BorrowResponseDto,
  PaginatedBorrowHistoryDto,
  ReturnRequestDto,
  ReturnResponseDto,
} from '../dtos/api.dtos';

export class HttpBorrowRepository implements IBorrowRepository {
  async borrowBook(parameters: BorrowBookParameters): Promise<BorrowRecord> {
    const payload: BorrowRequestDto = {
      memberCode: parameters.memberCode,
      bookCode: parameters.bookCode,
    };
    const response = await apiClient.post<BorrowResponseDto>('/borrow', payload);
    return new BorrowRecord({
      id: response.data.id,
      memberCode: response.data.memberCode,
      bookCode: response.data.bookCode,
      borrowedAt: response.data.borrowedAt,
      status: response.data.status,
    });
  }

  async returnBook(parameters: ReturnBookParameters): Promise<BorrowRecord> {
    const payload: ReturnRequestDto = {
      memberCode: parameters.memberCode,
      bookCode: parameters.bookCode,
    };
    const response = await apiClient.post<ReturnResponseDto>('/borrow/return', payload);
    return new BorrowRecord({
      id: response.data.id,
      memberCode: response.data.memberCode,
      bookCode: response.data.bookCode,
      borrowedAt: response.data.borrowedAt,
      returnedAt: response.data.returnedAt,
      status: 'RETURNED',
      wasOverdue: response.data.wasOverdue,
      penaltyApplied: response.data.penaltyApplied,
      penaltyUntil: response.data.penaltyUntil,
    });
  }

  async getActiveLoansByMember(memberCode: string): Promise<BorrowRecord[]> {
    const response = await apiClient.get<BorrowResponseDto[]>(
      `/borrow/member/${encodeURIComponent(memberCode)}`
    );
    return response.data.map(
      (dto) =>
        new BorrowRecord({
          id: dto.id,
          memberCode: dto.memberCode,
          bookCode: dto.bookCode,
          borrowedAt: dto.borrowedAt,
          status: 'BORROWED',
        })
    );
  }

  async getBorrowHistory(
    parameters?: GetBorrowHistoryParameters
  ): Promise<PaginatedBorrowHistory> {
    const page = parameters?.page ?? 1;
    const limit = parameters?.limit ?? 10;
    const response = await apiClient.get<PaginatedBorrowHistoryDto>('/borrow/history', {
      params: { page, limit },
    });

    return {
      records: response.data.data.map(
        (dto) =>
          new BorrowRecord({
            id: dto.id,
            memberCode: dto.memberCode,
            bookCode: dto.bookCode,
            borrowedAt: dto.borrowedAt,
            returnedAt: dto.returnedAt,
            status: dto.status,
          })
      ),
      total: response.data.total,
      page: response.data.page,
      limit: response.data.limit,
      hasMore: response.data.hasMore,
    };
  }
}

