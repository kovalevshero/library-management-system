import { GetBorrowHistoryUseCase } from '../../../src/application/use-cases/get-borrow-history.use-case';
import { IBorrowRepository, PaginatedBorrowHistory } from '../../../src/domain/repositories/borrow.repository.interface';
import { BorrowRecord } from '../../../src/domain/entities/borrow-record.entity';

describe('GetBorrowHistoryUseCase', () => {
  let mockBorrowRepository: jest.Mocked<IBorrowRepository>;
  let useCase: GetBorrowHistoryUseCase;

  beforeEach(() => {
    mockBorrowRepository = {
      borrowBook: jest.fn(),
      returnBook: jest.fn(),
      getActiveLoansByMember: jest.fn(),
      getBorrowHistory: jest.fn(),
    };
    useCase = new GetBorrowHistoryUseCase(mockBorrowRepository);
  });

  it('retrieves paginated transaction history with default parameters', async () => {
    const mockResult: PaginatedBorrowHistory = {
      records: [
        new BorrowRecord({
          id: 'rec-1',
          memberCode: 'M001',
          bookCode: 'JK-45',
          borrowedAt: '2026-09-23T10:00:00.000Z',
          status: 'BORROWED',
        }),
        new BorrowRecord({
          id: 'rec-2',
          memberCode: 'M002',
          bookCode: 'SHR-1',
          borrowedAt: '2026-09-23T09:00:00.000Z',
          returnedAt: '2026-09-23T09:30:00.000Z',
          status: 'RETURNED',
        }),
      ],
      total: 20,
      page: 1,
      limit: 10,
      hasMore: true,
    };

    mockBorrowRepository.getBorrowHistory.mockResolvedValue(mockResult);

    const result = await useCase.execute();

    expect(mockBorrowRepository.getBorrowHistory).toHaveBeenCalledWith(undefined);
    expect(result.records).toHaveLength(2);
    expect(result.total).toBe(20);
    expect(result.hasMore).toBe(true);
    expect(result.records[0].status).toBe('BORROWED');
    expect(result.records[1].status).toBe('RETURNED');
  });

  it('passes custom pagination parameters to repository when provided', async () => {
    const emptyResult: PaginatedBorrowHistory = {
      records: [],
      total: 25,
      page: 3,
      limit: 10,
      hasMore: false,
    };
    mockBorrowRepository.getBorrowHistory.mockResolvedValue(emptyResult);

    const result = await useCase.execute({ page: 3, limit: 10 });

    expect(mockBorrowRepository.getBorrowHistory).toHaveBeenCalledWith({ page: 3, limit: 10 });
    expect(result.page).toBe(3);
    expect(result.hasMore).toBe(false);
  });
});
