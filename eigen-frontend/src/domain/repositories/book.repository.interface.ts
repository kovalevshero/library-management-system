import { Book } from '../entities/book.entity';

export interface IBookRepository {
  getAllBooks(): Promise<Book[]>;
}
