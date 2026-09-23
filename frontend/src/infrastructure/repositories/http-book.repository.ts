import { Book } from '../../domain/entities/book.entity';
import { IBookRepository } from '../../domain/repositories/book.repository.interface';
import { apiClient } from '../api/http-client';
import { BookDto } from '../dtos/api.dtos';

export class HttpBookRepository implements IBookRepository {
  async getAllBooks(): Promise<Book[]> {
    const response = await apiClient.get<BookDto[]>('/books');
    return response.data.map(
      (dto) =>
        new Book({
          code: dto.code,
          title: dto.title,
          author: dto.author,
          stock: dto.stock,
          availableStock: dto.availableStock,
        })
    );
  }
}
