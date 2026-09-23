import { ReturnBookUseCase } from '../../src/application/use-cases/return-book/return-book.use-case';
import { IBookRepository } from '../../src/domain/repositories/book.repository.interface';
import { IMemberRepository } from '../../src/domain/repositories/member.repository.interface';
import { IBorrowRecordRepository } from '../../src/domain/repositories/borrow-record.repository.interface';
import { Book } from '../../src/domain/entities/book.entity';
import { Member } from '../../src/domain/entities/member.entity';
import { BorrowRecord } from '../../src/domain/entities/borrow-record.entity';
import {
  BookNotBorrowedByMemberException,
  EntityNotFoundException,
} from '../../src/domain/exceptions/domain.exception';

describe('ReturnBookUseCase', () => {
  let useCase: ReturnBookUseCase;
  let mockBookRepo: jest.Mocked<IBookRepository>;
  let mockMemberRepo: jest.Mocked<IMemberRepository>;
  let mockBorrowRepo: jest.Mocked<IBorrowRecordRepository>;

  beforeEach(() => {
    mockBookRepo = {
      findByCode: jest.fn(),
      findAll: jest.fn(),
      countActiveLoans: jest.fn(),
      countActiveLoansForBooks: jest.fn(),
      save: jest.fn(),
    };

    mockMemberRepo = {
      findByCode: jest.fn(),
      findAll: jest.fn(),
      countActiveLoans: jest.fn(),
      countActiveLoansForMembers: jest.fn(),
      save: jest.fn().mockImplementation(async (member: Member) => member),
    };

    mockBorrowRepo = {
      findActiveLoan: jest.fn(),
      findActiveLoansByMember: jest.fn(),
      findById: jest.fn(),
      save: jest
        .fn()
        .mockImplementation(async (record: BorrowRecord) => record),
    };

    useCase = new ReturnBookUseCase(
      mockMemberRepo,
      mockBookRepo,
      mockBorrowRepo,
    );
  });

  it('should return book on time without assigning penalty', async () => {
    const member = new Member({ code: 'M001', name: 'Angga' });
    const book = new Book({
      code: 'JK-45',
      title: 'Harry Potter',
      author: 'J.K Rowling',
      stock: 1,
    });
    const loan = new BorrowRecord({
      id: 'loan-1',
      memberCode: 'M001',
      bookCode: 'JK-45',
      borrowedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    });

    mockMemberRepo.findByCode.mockResolvedValue(member);
    mockBookRepo.findByCode.mockResolvedValue(book);
    mockBorrowRepo.findActiveLoan.mockResolvedValue(loan);

    const result = await useCase.execute({
      memberCode: 'M001',
      bookCode: 'JK-45',
    });

    expect(result.wasOverdue).toBe(false);
    expect(result.penaltyApplied).toBe(false);
    expect(result.penaltyUntil).toBeNull();
    expect(mockMemberRepo.save).not.toHaveBeenCalled();
    expect(mockBorrowRepo.save).toHaveBeenCalled();
  });

  it('should assign a 3-day penalty if the book is returned after more than 7 days', async () => {
    const member = new Member({ code: 'M001', name: 'Angga' });
    const book = new Book({
      code: 'JK-45',
      title: 'Harry Potter',
      author: 'J.K Rowling',
      stock: 1,
    });
    const loan = new BorrowRecord({
      id: 'loan-1',
      memberCode: 'M001',
      bookCode: 'JK-45',
      borrowedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
    });

    mockMemberRepo.findByCode.mockResolvedValue(member);
    mockBookRepo.findByCode.mockResolvedValue(book);
    mockBorrowRepo.findActiveLoan.mockResolvedValue(loan);

    const result = await useCase.execute({
      memberCode: 'M001',
      bookCode: 'JK-45',
    });

    expect(result.wasOverdue).toBe(true);
    expect(result.penaltyApplied).toBe(true);
    expect(result.penaltyUntil).not.toBeNull();
    expect(mockMemberRepo.save).toHaveBeenCalledWith(member);
    expect(member.isPenalized()).toBe(true);
  });

  it('should throw BookNotBorrowedByMemberException if member did not borrow this book', () => {
    const member = new Member({ code: 'M001', name: 'Angga' });
    const book = new Book({
      code: 'JK-45',
      title: 'Harry Potter',
      author: 'J.K Rowling',
      stock: 1,
    });

    mockMemberRepo.findByCode.mockResolvedValue(member);
    mockBookRepo.findByCode.mockResolvedValue(book);
    mockBorrowRepo.findActiveLoan.mockResolvedValue(null);

    return expect(
      useCase.execute({ memberCode: 'M001', bookCode: 'JK-45' }),
    ).rejects.toThrow(BookNotBorrowedByMemberException);
  });

  it('should throw EntityNotFoundException if member is not found', () => {
    mockMemberRepo.findByCode.mockResolvedValue(null);

    return expect(
      useCase.execute({ memberCode: 'UNKNOWN', bookCode: 'JK-45' }),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw EntityNotFoundException if book is not found', () => {
    const member = new Member({ code: 'M001', name: 'Angga' });
    mockMemberRepo.findByCode.mockResolvedValue(member);
    mockBookRepo.findByCode.mockResolvedValue(null);

    return expect(
      useCase.execute({ memberCode: 'M001', bookCode: 'UNKNOWN' }),
    ).rejects.toThrow(EntityNotFoundException);
  });
});
