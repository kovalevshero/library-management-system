import { Module } from '@nestjs/common';
import { PrismaService } from './infrastructure/database/prisma.service';
import { BOOK_REPOSITORY } from './domain/repositories/book.repository.interface';
import { MEMBER_REPOSITORY } from './domain/repositories/member.repository.interface';
import { BORROW_RECORD_REPOSITORY } from './domain/repositories/borrow-record.repository.interface';
import { PrismaBookRepository } from './infrastructure/repositories/prisma-book.repository';
import { PrismaMemberRepository } from './infrastructure/repositories/prisma-member.repository';
import { PrismaBorrowRecordRepository } from './infrastructure/repositories/prisma-borrow-record.repository';
import { BorrowBookUseCase } from './application/use-cases/borrow-book/borrow-book.use-case';
import { ReturnBookUseCase } from './application/use-cases/return-book/return-book.use-case';
import { GetMemberLoansUseCase } from './application/use-cases/check-loans/get-member-loans.use-case';
import { GetBorrowHistoryUseCase } from './application/use-cases/check-loans/get-borrow-history.use-case';
import { GetBooksUseCase } from './application/use-cases/check-books/get-books.use-case';
import { GetMembersUseCase } from './application/use-cases/check-members/get-members.use-case';
import { BooksController } from './presentation/controllers/books.controller';
import { MembersController } from './presentation/controllers/members.controller';
import { BorrowController } from './presentation/controllers/borrow.controller';

@Module({
  imports: [],
  controllers: [BooksController, MembersController, BorrowController],
  providers: [
    PrismaService,
    {
      provide: BOOK_REPOSITORY,
      useClass: PrismaBookRepository,
    },
    {
      provide: MEMBER_REPOSITORY,
      useClass: PrismaMemberRepository,
    },
    {
      provide: BORROW_RECORD_REPOSITORY,
      useClass: PrismaBorrowRecordRepository,
    },
    BorrowBookUseCase,
    ReturnBookUseCase,
    GetMemberLoansUseCase,
    GetBorrowHistoryUseCase,
    GetBooksUseCase,
    GetMembersUseCase,
  ],
})
export class AppModule {}
