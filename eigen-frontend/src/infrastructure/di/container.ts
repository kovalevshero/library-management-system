import { GetBooksUseCase } from '../../application/use-cases/get-books.use-case';
import { GetMembersUseCase } from '../../application/use-cases/get-members.use-case';
import { BorrowBookUseCase } from '../../application/use-cases/borrow-book.use-case';
import { ReturnBookUseCase } from '../../application/use-cases/return-book.use-case';
import { GetMemberLoansUseCase } from '../../application/use-cases/get-member-loans.use-case';
import { GetBorrowHistoryUseCase } from '../../application/use-cases/get-borrow-history.use-case';
import { HttpBookRepository } from '../repositories/http-book.repository';
import { HttpMemberRepository } from '../repositories/http-member.repository';
import { HttpBorrowRepository } from '../repositories/http-borrow.repository';
import { IBookRepository } from '../../domain/repositories/book.repository.interface';
import { IMemberRepository } from '../../domain/repositories/member.repository.interface';
import { IBorrowRepository } from '../../domain/repositories/borrow.repository.interface';

export interface ServiceContainer {
  bookRepository: IBookRepository;
  memberRepository: IMemberRepository;
  borrowRepository: IBorrowRepository;
  getBooksUseCase: GetBooksUseCase;
  getMembersUseCase: GetMembersUseCase;
  borrowBookUseCase: BorrowBookUseCase;
  returnBookUseCase: ReturnBookUseCase;
  getMemberLoansUseCase: GetMemberLoansUseCase;
  getBorrowHistoryUseCase: GetBorrowHistoryUseCase;
}

export function createServiceContainer(): ServiceContainer {
  const bookRepository = new HttpBookRepository();
  const memberRepository = new HttpMemberRepository();
  const borrowRepository = new HttpBorrowRepository();

  return {
    bookRepository,
    memberRepository,
    borrowRepository,
    getBooksUseCase: new GetBooksUseCase(bookRepository),
    getMembersUseCase: new GetMembersUseCase(memberRepository),
    borrowBookUseCase: new BorrowBookUseCase(borrowRepository),
    returnBookUseCase: new ReturnBookUseCase(borrowRepository),
    getMemberLoansUseCase: new GetMemberLoansUseCase(borrowRepository),
    getBorrowHistoryUseCase: new GetBorrowHistoryUseCase(borrowRepository),
  };
}

export const services = createServiceContainer();
