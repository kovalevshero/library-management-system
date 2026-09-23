import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BorrowBookUseCase } from '../../application/use-cases/borrow-book/borrow-book.use-case';
import { ReturnBookUseCase } from '../../application/use-cases/return-book/return-book.use-case';
import { GetMemberLoansUseCase } from '../../application/use-cases/check-loans/get-member-loans.use-case';
import { GetBorrowHistoryUseCase } from '../../application/use-cases/check-loans/get-borrow-history.use-case';
import { BorrowRequestDto } from '../dtos/borrow-request.dto';
import { ReturnRequestDto } from '../dtos/return-request.dto';
import { BorrowHistoryDto, PaginatedBorrowHistoryDto, BorrowResponseDto, ReturnResponseDto } from '../dtos/api-response.dto';

@ApiTags('Borrowing')
@Controller('api/borrow')
export class BorrowController {
  constructor(
    private readonly borrowBookUseCase: BorrowBookUseCase,
    private readonly returnBookUseCase: ReturnBookUseCase,
    private readonly getMemberLoansUseCase: GetMemberLoansUseCase,
    private readonly getBorrowHistoryUseCase: GetBorrowHistoryUseCase,
  ) {}

    @Get('history')
  @ApiOperation({
    summary: 'Get paginated borrow and return transaction history',
    description:
      'Returns paginated transaction logs with total count, current page, and hasMore status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction history retrieved successfully',
    type: PaginatedBorrowHistoryDto,
  })
  async getBorrowHistory(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedBorrowHistoryDto> {
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;

    const result = await this.getBorrowHistoryUseCase.execute({
      page: isNaN(parsedPage) ? 1 : parsedPage,
      limit: isNaN(parsedLimit) ? 10 : parsedLimit,
    });

    return {
      data: result.records.map((record) => ({
        id: record.id,
        memberCode: record.memberCode,
        bookCode: record.bookCode,
        borrowedAt: record.borrowedAt.toISOString(),
        returnedAt: record.returnedAt ? record.returnedAt.toISOString() : null,
        status: record.status,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore,
    };
  }

  @Get('member/:memberCode')
  @ApiOperation({
    summary: 'Get active loans by member',
    description: 'Returns all books currently borrowed by a specific member.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active loans retrieved successfully',
    type: [BorrowResponseDto],
  })
  async getActiveLoansByMember(
    @Param('memberCode') memberCode: string,
  ): Promise<BorrowResponseDto[]> {
    const loans = await this.getMemberLoansUseCase.execute(memberCode);
    return loans.map((loan) => ({
      id: loan.id,
      memberCode: loan.memberCode,
      bookCode: loan.bookCode,
      borrowedAt: loan.borrowedAt.toISOString(),
      status: 'BORROWED',
    }));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Borrow a book',
    description:
      'Allows a member to borrow a book if they have fewer than 2 active loans, are not penalized, and the book is in stock.',
  })
  @ApiResponse({
    status: 201,
    description: 'Book borrowed successfully',
    type: BorrowResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Borrow limit of 2 books reached, or bad request data',
  })
  @ApiResponse({
    status: 403,
    description: 'Member is currently under penalty and cannot borrow books',
  })
  @ApiResponse({
    status: 404,
    description: 'Member or book code not found',
  })
  @ApiResponse({
    status: 409,
    description:
      'Book is not available because it is currently borrowed by another member',
  })
  async borrowBook(@Body() dto: BorrowRequestDto): Promise<BorrowResponseDto> {
    return this.borrowBookUseCase.execute({
      memberCode: dto.memberCode,
      bookCode: dto.bookCode,
    });
  }

  @Post('return')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Return a book',
    description:
      'Processes book return. If returned after more than 7 days, a 3-day penalty is automatically assigned to the member.',
  })
  @ApiResponse({
    status: 200,
    description: 'Book returned successfully',
    type: ReturnResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Book was not borrowed by this member or is already returned',
  })
  @ApiResponse({
    status: 404,
    description: 'Member or book code not found',
  })
  async returnBook(@Body() dto: ReturnRequestDto): Promise<ReturnResponseDto> {
    return this.returnBookUseCase.execute({
      memberCode: dto.memberCode,
      bookCode: dto.bookCode,
    });
  }
}
