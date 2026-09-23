export type BorrowRecordStatus = 'BORROWED' | 'RETURNED';

export interface BorrowRecordProps {
  id: string;
  memberCode: string;
  bookCode: string;
  borrowedAt: Date;
  returnedAt?: Date | null;
  status?: BorrowRecordStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BorrowRecord {
  private readonly _id: string;
  private readonly _memberCode: string;
  private readonly _bookCode: string;
  private readonly _borrowedAt: Date;
  private _returnedAt: Date | null;
  private _status: BorrowRecordStatus;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  constructor(props: BorrowRecordProps) {
    this._id = props.id;
    this._memberCode = props.memberCode;
    this._bookCode = props.bookCode;
    this._borrowedAt = new Date(props.borrowedAt);
    this._returnedAt = props.returnedAt ? new Date(props.returnedAt) : null;
    this._status = props.status ?? 'BORROWED';
    this._createdAt = props.createdAt ? new Date(props.createdAt) : undefined;
    this._updatedAt = props.updatedAt ? new Date(props.updatedAt) : undefined;
  }

  get id(): string {
    return this._id;
  }

  get memberCode(): string {
    return this._memberCode;
  }

  get bookCode(): string {
    return this._bookCode;
  }

  get borrowedAt(): Date {
    return new Date(this._borrowedAt.getTime());
  }

  get returnedAt(): Date | null {
    return this._returnedAt ? new Date(this._returnedAt.getTime()) : null;
  }

  get status(): BorrowRecordStatus {
    return this._status;
  }

  get createdAt(): Date | undefined {
    return this._createdAt ? new Date(this._createdAt.getTime()) : undefined;
  }

  get updatedAt(): Date | undefined {
    return this._updatedAt ? new Date(this._updatedAt.getTime()) : undefined;
  }

  isOverdue(thresholdDays: number = 7, checkDate?: Date): boolean {
    const effectiveDate = checkDate ?? this._returnedAt ?? new Date();
    const durationMs = effectiveDate.getTime() - this._borrowedAt.getTime();
    const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;
    return durationMs > thresholdMs;
  }

  markAsReturned(
    returnDate: Date = new Date(),
    thresholdDays: number = 7,
  ): { wasOverdue: boolean } {
    if (this._status === 'RETURNED') {
      throw new Error('This borrow record is already marked as returned');
    }

    this._returnedAt = returnDate;
    this._status = 'RETURNED';

    const wasOverdue = this.isOverdue(thresholdDays, returnDate);
    return { wasOverdue };
  }
}
