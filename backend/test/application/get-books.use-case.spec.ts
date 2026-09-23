import { GetBooksUseCase } from '../../src/application/use-cases/check-books/get-books.use-case';
import { IBookRepository } from '../../src/domain/repositories/book.repository.interface';
import { Book } from '../../src/domain/entities/book.entity';

describe('GetBooksUseCase', () => {
  let useCase: GetBooksUseCase;
  let mockBookRepo: jest.Mocked<IBookRepository>;

  beforeEach(() => {
    mockBookRepo = {
      findByCode: jest.fn(),
      findAll: jest.fn(),
      countActiveLoans: jest.fn(),
      countActiveLoansForBooks: jest.fn(),
      save: jest.fn(),
    };
    useCase = new GetBooksUseCase(mockBookRepo);
  });

  it('should list all books with computed availableStock not counting borrowed books', async () => {
    const books = [
      new Book({
        code: 'JK-45',
        title: 'Harry Potter',
        author: 'J.K Rowling',
        stock: 1,
      }),
      new Book({
        code: 'SHR-1',
        title: 'A Study in Scarlet',
        author: 'Arthur Conan Doyle',
        stock: 2,
      }),
    ];

    mockBookRepo.findAll.mockResolvedValue(books);

    const activeMap = new Map<string, number>();
    activeMap.set('JK-45', 1);
    activeMap.set('SHR-1', 1);
    mockBookRepo.countActiveLoansForBooks.mockResolvedValue(activeMap);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      code: 'JK-45',
      title: 'Harry Potter',
      author: 'J.K Rowling',
      stock: 1,
      availableStock: 0,
    });
    expect(result[1]).toEqual({
      code: 'SHR-1',
      title: 'A Study in Scarlet',
      author: 'Arthur Conan Doyle',
      stock: 2,
      availableStock: 1,
    });
  });
});
