export interface MemberProperties {
  code: string;
  name: string;
  borrowedBooksCount: number;
  isPenalized: boolean;
  penaltyUntil: string | null;
}

export class Member {
  readonly code: string;
  readonly name: string;
  readonly borrowedBooksCount: number;
  readonly isPenalized: boolean;
  readonly penaltyUntil: string | null;

  static readonly MAX_BORROW_LIMIT = 2;

  constructor(properties: MemberProperties) {
    this.code = properties.code;
    this.name = properties.name;
    this.borrowedBooksCount = properties.borrowedBooksCount;
    this.isPenalized = properties.isPenalized;
    this.penaltyUntil = properties.penaltyUntil;
  }

  // Members may not borrow more than 2 books and must have no active penalty
  get canBorrow(): boolean {
    return !this.isPenalized && this.borrowedBooksCount < Member.MAX_BORROW_LIMIT;
  }

  // Reason why borrowing is disallowed, or null if eligible
  get borrowDisallowedReason(): string | null {
    if (this.isPenalized) {
      return this.penaltyUntil
        ? `Under active penalty until ${new Date(this.penaltyUntil).toLocaleDateString()}`
        : 'Member is currently under penalty';
    }
    if (this.borrowedBooksCount >= Member.MAX_BORROW_LIMIT) {
      return `Reached maximum borrowing limit (${Member.MAX_BORROW_LIMIT} books)`;
    }
    return null;
  }
}
