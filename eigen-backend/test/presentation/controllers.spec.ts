import { BooksController } from '../../src/presentation/controllers/books.controller';
import { MembersController } from '../../src/presentation/controllers/members.controller';
import { BorrowController } from '../../src/presentation/controllers/borrow.controller';
import { GetBooksUseCase } from '../../src/application/use-cases/check-books/get-books.use-case';
import { GetMembersUseCase } from '../../src/application/use-cases/check-members/get-members.use-case';
import { BorrowBookUseCase } from '../../src/application/use-cases/borrow-book/borrow-book.use-case';
import { ReturnBookUseCase } from '../../src/application/use-cases/return-book/return-book.use-case';
import { GetMemberLoansUseCase } from '../../src/application/use-cases/check-loans/get-member-loans.use-case';
import { GetBorrowHistoryUseCase } from '../../src/application/use-cases/check-loans/get-borrow-history.use-case';

describe('Presentation Controllers', () => {
  describe('BooksController', () => {
    it('should delegate to GetBooksUseCase', async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue([
          {
            code: 'JK-45',
            title: 'Harry Potter',
            author: 'J.K Rowling',
            stock: 1,
            availableStock: 1,
          },
        ]),
      } as unknown as GetBooksUseCase;

      const controller = new BooksController(mockUseCase);
      const result = await controller.getAllBooks();

      expect(mockUseCase.execute).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('MembersController', () => {
    it('should delegate to GetMembersUseCase', async () => {
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue([
          {
            code: 'M001',
            name: 'Angga',
            borrowedBooksCount: 0,
            isPenalized: false,
            penaltyUntil: null,
          },
        ]),
      } as unknown as GetMembersUseCase;

      const controller = new MembersController(mockUseCase);
      const result = await controller.getAllMembers();

      expect(mockUseCase.execute).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('BorrowController', () => {
    it('should delegate borrow to BorrowBookUseCase', async () => {
      const mockBorrowUseCase = {
        execute: jest.fn().mockResolvedValue({
          id: 'loan-1',
          memberCode: 'M001',
          bookCode: 'JK-45',
          borrowedAt: new Date().toISOString(),
          status: 'BORROWED',
        }),
      } as unknown as BorrowBookUseCase;

      const mockReturnUseCase = {} as unknown as ReturnBookUseCase;

      const controller = new BorrowController(
        mockBorrowUseCase,
        mockReturnUseCase,
        {} as unknown as GetMemberLoansUseCase,
        {} as unknown as GetBorrowHistoryUseCase,
      );
      const result = await controller.borrowBook({
        memberCode: 'M001',
        bookCode: 'JK-45',
      });

      expect(mockBorrowUseCase.execute).toHaveBeenCalledWith({
        memberCode: 'M001',
        bookCode: 'JK-45',
      });
      expect(result.status).toBe('BORROWED');
    });

    it('should delegate return to ReturnBookUseCase', async () => {
      const mockBorrowUseCase = {} as unknown as BorrowBookUseCase;
      const mockReturnUseCase = {
        execute: jest.fn().mockResolvedValue({
          id: 'loan-1',
          memberCode: 'M001',
          bookCode: 'JK-45',
          borrowedAt: new Date().toISOString(),
          returnedAt: new Date().toISOString(),
          wasOverdue: false,
          penaltyApplied: false,
          penaltyUntil: null,
        }),
      } as unknown as ReturnBookUseCase;

      const controller = new BorrowController(
        mockBorrowUseCase,
        mockReturnUseCase,
        {} as unknown as GetMemberLoansUseCase,
        {} as unknown as GetBorrowHistoryUseCase,
      );
      const result = await controller.returnBook({
        memberCode: 'M001',
        bookCode: 'JK-45',
      });

      expect(mockReturnUseCase.execute).toHaveBeenCalledWith({
        memberCode: 'M001',
        bookCode: 'JK-45',
      });
      expect(result.wasOverdue).toBe(false);
    });
  });
});
