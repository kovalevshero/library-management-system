import { Book } from '../../domain/entities/book.entity';
import { IBookRepository } from '../../domain/repositories/book.repository.interface';

export class GetBooksUseCase {
  constructor(private readonly bookRepository: IBookRepository) {}

  async execute(): Promise<Book[]> {
    return this.bookRepository.getAllBooks();
  }
}
