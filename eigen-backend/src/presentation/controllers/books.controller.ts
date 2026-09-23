import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetBooksUseCase } from '../../application/use-cases/check-books/get-books.use-case';
import { BookPresentationDto } from '../dtos/api-response.dto';

@ApiTags('Books')
@Controller('api/books')
export class BooksController {
  constructor(private readonly getBooksUseCase: GetBooksUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Get all books',
    description:
      'Returns all registered books along with total stock and available stock.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of books retrieved successfully',
    type: [BookPresentationDto],
  })
  async getAllBooks(): Promise<BookPresentationDto[]> {
    return this.getBooksUseCase.execute();
  }
}
