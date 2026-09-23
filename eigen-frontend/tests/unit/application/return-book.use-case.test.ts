import { ReturnBookUseCase } from '../../../src/application/use-cases/return-book.use-case';
import { IBorrowRepository } from '../../../src/domain/repositories/borrow.repository.interface';
import { BorrowRecord } from '../../../src/domain/entities/borrow-record.entity';

describe('ReturnBookUseCase', () => {
  let mockBorrowRepository: jest.Mocked<IBorrowRepository>;
  let useCase: ReturnBookUseCase;

  beforeEach(() => {
    mockBorrowRepository = {
      borrowBook: jest.fn(),
      returnBook: jest.fn(),
      getActiveLoansByMember: jest.fn(),
      getBorrowHistory: jest.fn(),
    };
    useCase = new ReturnBookUseCase(mockBorrowRepository);
  });

  it('delegates return request to repository and reflects penalty flags', async () => {
    const mockRecord = new BorrowRecord({
      id: 'loan-123',
      memberCode: 'M001',
      bookCode: 'JK-45',
      borrowedAt: '2026-09-01T10:00:00.000Z',
      returnedAt: '2026-09-23T10:00:00.000Z',
      status: 'RETURNED',
      wasOverdue: true,
      penaltyApplied: true,
      penaltyUntil: '2026-09-26T10:00:00.000Z',
    });

    mockBorrowRepository.returnBook.mockResolvedValue(mockRecord);

    const result = await useCase.execute({
      memberCode: 'M001',
      bookCode: 'JK-45',
    });

    expect(mockBorrowRepository.returnBook).toHaveBeenCalledWith({
      memberCode: 'M001',
      bookCode: 'JK-45',
    });
    expect(result.status).toBe('RETURNED');
    expect(result.wasOverdue).toBe(true);
    expect(result.penaltyApplied).toBe(true);
  });

  it('validates required fields before calling repository', async () => {
    await expect(
      useCase.execute({ memberCode: '', bookCode: 'JK-45' })
    ).rejects.toThrow('Member code is required');

    await expect(
      useCase.execute({ memberCode: 'M001', bookCode: '  ' })
    ).rejects.toThrow('Book code is required');
  });
});
