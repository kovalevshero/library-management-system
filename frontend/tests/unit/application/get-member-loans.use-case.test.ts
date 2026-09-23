import { GetMemberLoansUseCase } from '../../../src/application/use-cases/get-member-loans.use-case';
import { IBorrowRepository } from '../../../src/domain/repositories/borrow.repository.interface';
import { BorrowRecord } from '../../../src/domain/entities/borrow-record.entity';

describe('GetMemberLoansUseCase', () => {
  let mockBorrowRepository: jest.Mocked<IBorrowRepository>;
  let useCase: GetMemberLoansUseCase;

  beforeEach(() => {
    mockBorrowRepository = {
      borrowBook: jest.fn(),
      returnBook: jest.fn(),
      getActiveLoansByMember: jest.fn(),
      getBorrowHistory: jest.fn(),
    };
    useCase = new GetMemberLoansUseCase(mockBorrowRepository);
  });

  it('retrieves active loans for the specified member', async () => {
    const mockLoans: BorrowRecord[] = [
      new BorrowRecord({
        id: 'rec-1',
        memberCode: 'M001',
        bookCode: 'JK-45',
        borrowedAt: '2026-09-23T10:00:00.000Z',
        status: 'BORROWED',
      }),
    ];

    mockBorrowRepository.getActiveLoansByMember.mockResolvedValue(mockLoans);

    const result = await useCase.execute('M001');

    expect(mockBorrowRepository.getActiveLoansByMember).toHaveBeenCalledWith('M001');
    expect(result).toHaveLength(1);
    expect(result[0].bookCode).toBe('JK-45');
  });

  it('returns empty array when memberCode is blank or whitespace', async () => {
    const resultEmpty = await useCase.execute('');
    const resultWhitespace = await useCase.execute('   ');

    expect(resultEmpty).toEqual([]);
    expect(resultWhitespace).toEqual([]);
    expect(mockBorrowRepository.getActiveLoansByMember).not.toHaveBeenCalled();
  });
});
