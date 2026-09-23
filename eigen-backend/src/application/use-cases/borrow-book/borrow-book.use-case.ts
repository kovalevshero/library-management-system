import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
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
import { BorrowRecord } from '../../../domain/entities/borrow-record.entity';
import {
  BookNotAvailableException,
  BorrowLimitExceededException,
  EntityNotFoundException,
  MemberPenalizedException,
} from '../../../domain/exceptions/domain.exception';
import { BorrowResultDto } from '../../dtos/library.dto';

export interface BorrowBookCommand {
  memberCode: string;
  bookCode: string;
}

@Injectable()
export class BorrowBookUseCase {
  constructor(
    @Inject(MEMBER_REPOSITORY)
    private readonly memberRepository: IMemberRepository,
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
    @Inject(BORROW_RECORD_REPOSITORY)
    private readonly borrowRecordRepository: IBorrowRecordRepository,
  ) {}

  async execute(command: BorrowBookCommand): Promise<BorrowResultDto> {
    const member = await this.memberRepository.findByCode(command.memberCode);
    if (!member) {
      throw new EntityNotFoundException('Member', command.memberCode);
    }

    const book = await this.bookRepository.findByCode(command.bookCode);
    if (!book) {
      throw new EntityNotFoundException('Book', command.bookCode);
    }

    const now = new Date();
    if (member.isPenalized(now)) {
      throw new MemberPenalizedException(member.code, member.penaltyUntil!);
    }

    const activeMemberLoansCount = await this.memberRepository.countActiveLoans(
      member.code,
    );
    if (activeMemberLoansCount >= 2) {
      throw new BorrowLimitExceededException(member.code, 2);
    }

    const activeBookLoansCount = await this.bookRepository.countActiveLoans(
      book.code,
    );
    if (!book.isAvailable(activeBookLoansCount)) {
      throw new BookNotAvailableException(book.code);
    }

    const record = new BorrowRecord({
      id: randomUUID(),
      memberCode: member.code,
      bookCode: book.code,
      borrowedAt: now,
      status: 'BORROWED',
    });

    const savedRecord = await this.borrowRecordRepository.save(record);

    return {
      id: savedRecord.id,
      memberCode: savedRecord.memberCode,
      bookCode: savedRecord.bookCode,
      borrowedAt: savedRecord.borrowedAt.toISOString(),
      status: savedRecord.status,
    };
  }
}
