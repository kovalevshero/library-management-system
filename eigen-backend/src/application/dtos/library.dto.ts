export interface BookResponseDto {
  code: string;
  title: string;
  author: string;
  stock: number;
  availableStock: number;
}

export interface MemberResponseDto {
  code: string;
  name: string;
  borrowedBooksCount: number;
  isPenalized: boolean;
  penaltyUntil: string | null;
}

export interface BorrowResultDto {
  id: string;
  memberCode: string;
  bookCode: string;
  borrowedAt: string;
  status: string;
}

export interface ReturnResultDto {
  id: string;
  memberCode: string;
  bookCode: string;
  borrowedAt: string;
  returnedAt: string;
  wasOverdue: boolean;
  penaltyApplied: boolean;
  penaltyUntil: string | null;
}
