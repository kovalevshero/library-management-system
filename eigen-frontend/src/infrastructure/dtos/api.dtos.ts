export interface BookDto {
  code: string;
  title: string;
  author: string;
  stock: number;
  availableStock: number;
}

export interface MemberDto {
  code: string;
  name: string;
  borrowedBooksCount: number;
  isPenalized: boolean;
  penaltyUntil: string | null;
}

export interface BorrowRequestDto {
  memberCode: string;
  bookCode: string;
}

export interface ReturnRequestDto {
  memberCode: string;
  bookCode: string;
}

export interface BorrowResponseDto {
  id: string;
  memberCode: string;
  bookCode: string;
  borrowedAt: string;
  status: 'BORROWED';
}

export interface ReturnResponseDto {
  id: string;
  memberCode: string;
  bookCode: string;
  borrowedAt: string;
  returnedAt: string;
  wasOverdue: boolean;
  penaltyApplied: boolean;
  penaltyUntil: string | null;
}

export interface BorrowHistoryDto {
  id: string;
  memberCode: string;
  bookCode: string;
  borrowedAt: string;
  returnedAt: string | null;
  status: 'BORROWED' | 'RETURNED';
}

export interface PaginatedBorrowHistoryDto {
  data: BorrowHistoryDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
  timestamp?: string;
  path?: string;
}
