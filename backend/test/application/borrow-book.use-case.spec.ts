import { BorrowBookUseCase } from '../../src/application/use-cases/borrow-book/borrow-book.use-case';
import { IBookRepository } from '../../src/domain/repositories/book.repository.interface';
import { IMemberRepository } from '../../src/domain/repositories/member.repository.interface';
import { IBorrowRecordRepository } from '../../src/domain/repositories/borrow-record.repository.interface';
import { Book } from '../../src/domain/entities/book.entity';
import { Member } from '../../src/domain/entities/member.entity';
import { BorrowRecord } from '../../src/domain/entities/borrow-record.entity';
import {
  BookNotAvailableException,
  BorrowLimitExceededException,
  EntityNotFoundException,
  MemberPenalizedException,
} from '../../src/domain/exceptions/domain.exception';

describe('BorrowBookUseCase', () => {
  let useCase: BorrowBookUseCase;
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
      save: jest.fn(),
    };

    mockBorrowRepo = {
      findActiveLoan: jest.fn(),
      findActiveLoansByMember: jest.fn(),
      findById: jest.fn(),
      save: jest
        .fn()
        .mockImplementation(async (record: BorrowRecord) => record),
    };

    useCase = new BorrowBookUseCase(
      mockMemberRepo,
      mockBookRepo,
      mockBorrowRepo,
    );
  });

  it('should successfully borrow a book when all conditions are satisfied', () => {
    const member = new Member({ code: 'M001', name: 'Angga' });
    const book = new Book({
      code: 'JK-45',
      title: 'Harry Potter',
      author: 'J.K Rowling',
      stock: 1,
    });

    mockMemberRepo.findByCode.mockResolvedValue(member);
    mockBookRepo.findByCode.mockResolvedValue(book);
    mockMemberRepo.countActiveLoans.mockResolvedValue(0);
    mockBookRepo.countActiveLoans.mockResolvedValue(0);

    return expect(
      useCase.execute({ memberCode: 'M001', bookCode: 'JK-45' }),
    ).resolves.toMatchObject({
      memberCode: 'M001',
      bookCode: 'JK-45',
      status: 'BORROWED',
    });
  });

  it('should throw EntityNotFoundException if member is not registered', () => {
    mockMemberRepo.findByCode.mockResolvedValue(null);

    return expect(
      useCase.execute({ memberCode: 'M999', bookCode: 'JK-45' }),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw EntityNotFoundException if book is not in catalog', () => {
    const member = new Member({ code: 'M001', name: 'Angga' });
    mockMemberRepo.findByCode.mockResolvedValue(member);
    mockBookRepo.findByCode.mockResolvedValue(null);

    return expect(
      useCase.execute({ memberCode: 'M001', bookCode: 'UNKNOWN' }),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw MemberPenalizedException if member is currently penalized', () => {
    const futureDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const member = new Member({
      code: 'M001',
      name: 'Angga',
      penaltyUntil: futureDate,
    });
    const book = new Book({
      code: 'JK-45',
      title: 'Harry Potter',
      author: 'J.K Rowling',
      stock: 1,
    });

    mockMemberRepo.findByCode.mockResolvedValue(member);
    mockBookRepo.findByCode.mockResolvedValue(book);

    return expect(
      useCase.execute({ memberCode: 'M001', bookCode: 'JK-45' }),
    ).rejects.toThrow(MemberPenalizedException);
  });

  it('should throw BorrowLimitExceededException if member already borrowed 2 books', () => {
    const member = new Member({ code: 'M001', name: 'Angga' });
    const book = new Book({
      code: 'JK-45',
      title: 'Harry Potter',
      author: 'J.K Rowling',
      stock: 1,
    });

    mockMemberRepo.findByCode.mockResolvedValue(member);
    mockBookRepo.findByCode.mockResolvedValue(book);
    mockMemberRepo.countActiveLoans.mockResolvedValue(2);

    return expect(
      useCase.execute({ memberCode: 'M001', bookCode: 'JK-45' }),
    ).rejects.toThrow(BorrowLimitExceededException);
  });

  it('should throw BookNotAvailableException if book is already borrowed by another member', () => {
    const member = new Member({ code: 'M002', name: 'Ferry' });
    const book = new Book({
      code: 'JK-45',
      title: 'Harry Potter',
      author: 'J.K Rowling',
      stock: 1,
    });

    mockMemberRepo.findByCode.mockResolvedValue(member);
    mockBookRepo.findByCode.mockResolvedValue(book);
    mockMemberRepo.countActiveLoans.mockResolvedValue(0);
    mockBookRepo.countActiveLoans.mockResolvedValue(1);

    return expect(
      useCase.execute({ memberCode: 'M002', bookCode: 'JK-45' }),
    ).rejects.toThrow(BookNotAvailableException);
  });
});
