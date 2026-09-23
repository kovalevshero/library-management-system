import { Book } from '../entities/book.entity';

export interface IBookRepository {
  findByCode(code: string): Promise<Book | null>;
  findAll(): Promise<Book[]>;
  countActiveLoans(bookCode: string): Promise<number>;
  countActiveLoansForBooks(): Promise<Map<string, number>>;
  save(book: Book): Promise<Book>;
}

export const BOOK_REPOSITORY = Symbol('IBookRepository');
