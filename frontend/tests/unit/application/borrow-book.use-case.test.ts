import { BorrowBookUseCase } from '../../../src/application/use-cases/borrow-book.use-case';
import { IBorrowRepository } from '../../../src/domain/repositories/borrow.repository.interface';
import { BorrowRecord } from '../../../src/domain/entities/borrow-record.entity';

describe('BorrowBookUseCase', () => {
  let mockBorrowRepository: jest.Mocked<IBorrowRepository>;
  let useCase: BorrowBookUseCase;

  beforeEach(() => {
    mockBorrowRepository = {
      borrowBook: jest.fn(),
      returnBook: jest.fn(),
      getActiveLoansByMember: jest.fn(),
      getBorrowHistory: jest.fn(),
    };
    useCase = new BorrowBookUseCase(mockBorrowRepository);
  });

  it('successfully delegates loan transaction to repository', async () => {
    const mockRecord = new BorrowRecord({
      id: 'loan-123',
      memberCode: 'M001',
      bookCode: 'JK-45',
      borrowedAt: '2026-09-23T10:00:00.000Z',
      status: 'BORROWED',
    });

    mockBorrowRepository.borrowBook.mockResolvedValue(mockRecord);

    const result = await useCase.execute({
      memberCode: 'M001',
      bookCode: 'JK-45',
    });

    expect(mockBorrowRepository.borrowBook).toHaveBeenCalledWith({
      memberCode: 'M001',
      bookCode: 'JK-45',
    });
    expect(result.id).toBe('loan-123');
    expect(result.status).toBe('BORROWED');
  });

  it('throws validation error if memberCode is blank', async () => {
    await expect(
      useCase.execute({
        memberCode: '   ',
        bookCode: 'JK-45',
      })
    ).rejects.toThrow('Member code is required');

    expect(mockBorrowRepository.borrowBook).not.toHaveBeenCalled();
  });

  it('throws validation error if bookCode is blank', async () => {
    await expect(
      useCase.execute({
        memberCode: 'M001',
        bookCode: '',
      })
    ).rejects.toThrow('Book code is required');

    expect(mockBorrowRepository.borrowBook).not.toHaveBeenCalled();
  });
});
