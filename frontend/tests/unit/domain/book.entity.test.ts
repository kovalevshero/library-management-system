import { Book } from '../../../src/domain/entities/book.entity';

describe('Book Entity', () => {
  it('identifies book with positive available stock as available', () => {
    const book = new Book({
      code: 'JK-45',
      title: 'Harry Potter',
      author: 'J.K Rowling',
      stock: 1,
      availableStock: 1,
    });

    expect(book.isAvailable).toBe(true);
    expect(book.borrowedCount).toBe(0);
  });

  it('identifies book with zero available stock as unavailable', () => {
    const book = new Book({
      code: 'JK-45',
      title: 'Harry Potter',
      author: 'J.K Rowling',
      stock: 1,
      availableStock: 0,
    });

    expect(book.isAvailable).toBe(false);
    expect(book.borrowedCount).toBe(1);
  });

  it('correctly calculates borrowed count when multiple copies exist', () => {
    const book = new Book({
      code: 'TW-11',
      title: 'Twilight',
      author: 'Stephenie Meyer',
      stock: 5,
      availableStock: 2,
    });

    expect(book.isAvailable).toBe(true);
    expect(book.borrowedCount).toBe(3);
  });
});
