import { Book } from '../../src/domain/entities/book.entity';

describe('Book Entity', () => {
  it('should initialize correctly with valid properties', () => {
    const book = new Book({
      code: 'JK-45',
      title: 'Harry Potter',
      author: 'J.K Rowling',
      stock: 1,
    });

    expect(book.code).toBe('JK-45');
    expect(book.title).toBe('Harry Potter');
    expect(book.author).toBe('J.K Rowling');
    expect(book.stock).toBe(1);
  });

  it('should throw an error if code is empty', () => {
    expect(
      () =>
        new Book({
          code: '',
          title: 'Harry Potter',
          author: 'J.K Rowling',
          stock: 1,
        }),
    ).toThrow('Book code cannot be empty');
  });

  it('should throw an error if stock is negative', () => {
    expect(
      () =>
        new Book({
          code: 'JK-45',
          title: 'Harry Potter',
          author: 'J.K Rowling',
          stock: -1,
        }),
    ).toThrow('Book stock cannot be negative');
  });

  it('should correctly calculate available stock', () => {
    const book = new Book({
      code: 'JK-45',
      title: 'Harry Potter',
      author: 'J.K Rowling',
      stock: 2,
    });

    expect(book.getAvailableStock(0)).toBe(2);
    expect(book.getAvailableStock(1)).toBe(1);
    expect(book.getAvailableStock(2)).toBe(0);
    expect(book.getAvailableStock(3)).toBe(0);
  });

  it('should report availability accurately based on active loans', () => {
    const book = new Book({
      code: 'JK-45',
      title: 'Harry Potter',
      author: 'J.K Rowling',
      stock: 1,
    });

    expect(book.isAvailable(0)).toBe(true);
    expect(book.isAvailable(1)).toBe(false);
  });
});
