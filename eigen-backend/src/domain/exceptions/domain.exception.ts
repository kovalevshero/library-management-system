export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class MemberPenalizedException extends DomainException {
  constructor(memberCode: string, penaltyUntil: Date) {
    super(
      `Member ${memberCode} is currently penalized until ${penaltyUntil.toISOString()}`,
    );
  }
}

export class BorrowLimitExceededException extends DomainException {
  constructor(memberCode: string, maxAllowed: number = 2) {
    super(
      `Member ${memberCode} has reached the maximum borrowing limit of ${maxAllowed} books`,
    );
  }
}

export class BookNotAvailableException extends DomainException {
  constructor(bookCode: string) {
    super(`Book ${bookCode} is currently not available for borrowing`);
  }
}

export class BookNotBorrowedByMemberException extends DomainException {
  constructor(memberCode: string, bookCode: string) {
    super(
      `Book ${bookCode} was not borrowed by member ${memberCode} or is already returned`,
    );
  }
}

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, identifier: string) {
    super(`${entityName} with identifier ${identifier} was not found`);
  }
}
