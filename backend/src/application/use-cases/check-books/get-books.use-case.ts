import { Inject, Injectable } from '@nestjs/common';
import {
  BOOK_REPOSITORY,
  IBookRepository,
} from '../../../domain/repositories/book.repository.interface';
import { BookResponseDto } from '../../dtos/library.dto';

@Injectable()
export class GetBooksUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
  ) {}

  async execute(): Promise<BookResponseDto[]> {
    const books = await this.bookRepository.findAll();
    const activeLoansMap = await this.bookRepository.countActiveLoansForBooks();

    return books.map((book) => {
      const activeCount = activeLoansMap.get(book.code) ?? 0;
      return {
        code: book.code,
        title: book.title,
        author: book.author,
        stock: book.stock,
        availableStock: book.getAvailableStock(activeCount),
      };
    });
  }
}
