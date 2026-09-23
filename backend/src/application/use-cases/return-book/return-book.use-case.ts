import { Inject, Injectable } from '@nestjs/common';
import {
  BOOK_REPOSITORY,
  IBookRepository,
} from '../../../domain/repositories/book.repository.interface';
import {
  MEMBER_REPOSITORY,
  IMemberRepository,
} from '../../../domain/repositories/member.repository.interface';
import {
  BORROW_RECORD_REPOSITORY,
  IBorrowRecordRepository,
} from '../../../domain/repositories/borrow-record.repository.interface';
import {
  BookNotBorrowedByMemberException,
  EntityNotFoundException,
} from '../../../domain/exceptions/domain.exception';
import { ReturnResultDto } from '../../dtos/library.dto';

export interface ReturnBookCommand {
  memberCode: string;
  bookCode: string;
}

@Injectable()
export class ReturnBookUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY)
    private readonly memberRepository: IMemberRepository,
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
    @Inject(BORROW_RECORD_REPOSITORY)
    private readonly borrowRecordRepository: IBorrowRecordRepository,
  ) {}

  async execute(command: ReturnBookCommand): Promise<ReturnResultDto> {
    const member = await this.memberRepository.findByCode(command.memberCode);
    if (!member) {
      throw new EntityNotFoundException('Member', command.memberCode);
    }

    const book = await this.bookRepository.findByCode(command.bookCode);
    if (!book) {
      throw new EntityNotFoundException('Book', command.bookCode);
    }

    const loan = await this.borrowRecordRepository.findActiveLoan(
      member.code,
      book.code,
    );
    if (!loan) {
      throw new BookNotBorrowedByMemberException(member.code, book.code);
    }

    const returnDate = new Date();
    const { wasOverdue } = loan.markAsReturned(returnDate, 7);

    let penaltyApplied = false;
    if (wasOverdue) {
      // Library rule: overdue returns incur a 3-day suspension from new loans.
      member.applyPenalty(3, returnDate);
      await this.memberRepository.save(member);
      penaltyApplied = true;
    }

    const savedLoan = await this.borrowRecordRepository.save(loan);

    return {
      id: savedLoan.id,
      memberCode: savedLoan.memberCode,
      bookCode: savedLoan.bookCode,
      borrowedAt: savedLoan.borrowedAt.toISOString(),
      returnedAt: savedLoan.returnedAt!.toISOString(),
      wasOverdue,
      penaltyApplied,
      penaltyUntil: member.penaltyUntil
        ? member.penaltyUntil.toISOString()
        : null,
    };
  }
}
