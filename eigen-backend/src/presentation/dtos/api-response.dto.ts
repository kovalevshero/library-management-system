import { ApiProperty } from '@nestjs/swagger';

export class BookPresentationDto {
  @ApiProperty({ example: 'JK-45' })
  code: string;

  @ApiProperty({ example: 'Harry Potter' })
  title: string;

  @ApiProperty({ example: 'J.K Rowling' })
  author: string;

  @ApiProperty({ example: 1, description: 'Total owned stock' })
  stock: number;

  @ApiProperty({
    example: 1,
    description: 'Current available stock for borrowing',
  })
  availableStock: number;
}

export class MemberPresentationDto {
  @ApiProperty({ example: 'M001' })
  code: string;

  @ApiProperty({ example: 'Angga' })
  name: string;

  @ApiProperty({
    example: 0,
    description: 'Number of books currently borrowed',
  })
  borrowedBooksCount: number;

  @ApiProperty({
    example: false,
    description: 'Whether the member is currently penalized',
  })
  isPenalized: boolean;

  @ApiProperty({
    example: null,
    nullable: true,
    description: 'Timestamp until penalty expires, or null if not penalized',
  })
  penaltyUntil: string | null;
}

export class BorrowResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'M001' })
  memberCode: string;

  @ApiProperty({ example: 'JK-45' })
  bookCode: string;

  @ApiProperty({ example: '2026-09-23T09:00:00.000Z' })
  borrowedAt: string;

  @ApiProperty({ example: 'BORROWED' })
  status: string;
}

export class ReturnResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'M001' })
  memberCode: string;

  @ApiProperty({ example: 'JK-45' })
  bookCode: string;

  @ApiProperty({ example: '2026-09-23T09:00:00.000Z' })
  borrowedAt: string;

  @ApiProperty({ example: '2026-09-23T09:30:00.000Z' })
  returnedAt: string;

  @ApiProperty({
    example: false,
    description: 'Indicates if returned after more than 7 days',
  })
  wasOverdue: boolean;

  @ApiProperty({
    example: false,
    description: 'Indicates if a 3-day penalty was assigned',
  })
  penaltyApplied: boolean;

  @ApiProperty({
    example: null,
    nullable: true,
    description: 'Timestamp when penalty expires, if applied',
  })
  penaltyUntil: string | null;
}


export class BorrowHistoryDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'M001' })
  memberCode: string;

  @ApiProperty({ example: 'JK-45' })
  bookCode: string;

  @ApiProperty({ example: '2026-09-23T09:00:00.000Z' })
  borrowedAt: string;

  @ApiProperty({ example: '2026-09-23T09:30:00.000Z', nullable: true })
  returnedAt: string | null;

  @ApiProperty({ example: 'BORROWED' })
  status: string;
}


export class PaginatedBorrowHistoryDto {
  @ApiProperty({ type: [BorrowHistoryDto] })
  data: BorrowHistoryDto[];

  @ApiProperty({ example: 25, description: 'Total number of borrow records' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of records per page' })
  limit: number;

  @ApiProperty({ example: true, description: 'Whether more pages are available' })
  hasMore: boolean;
}
