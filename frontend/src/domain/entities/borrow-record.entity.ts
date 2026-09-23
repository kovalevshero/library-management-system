export interface BorrowRecordProperties {
  id: string;
  memberCode: string;
  bookCode: string;
  borrowedAt: string;
  returnedAt?: string | null;
  status: 'BORROWED' | 'RETURNED';
  wasOverdue?: boolean;
  penaltyApplied?: boolean;
  penaltyUntil?: string | null;
}

export class BorrowRecord {
  readonly id: string;
  readonly memberCode: string;
  readonly bookCode: string;
  readonly borrowedAt: string;
  readonly returnedAt: string | null;
  readonly status: 'BORROWED' | 'RETURNED';
  readonly wasOverdue: boolean;
  readonly penaltyApplied: boolean;
  readonly penaltyUntil: string | null;

  constructor(properties: BorrowRecordProperties) {
    this.id = properties.id;
    this.memberCode = properties.memberCode;
    this.bookCode = properties.bookCode;
    this.borrowedAt = properties.borrowedAt;
    this.returnedAt = properties.returnedAt ?? null;
    this.status = properties.status;
    this.wasOverdue = properties.wasOverdue ?? false;
    this.penaltyApplied = properties.penaltyApplied ?? false;
    this.penaltyUntil = properties.penaltyUntil ?? null;
  }
}
