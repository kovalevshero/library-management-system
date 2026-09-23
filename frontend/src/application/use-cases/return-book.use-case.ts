import { BorrowRecord } from '../../domain/entities/borrow-record.entity';
import {
  IBorrowRepository,
  ReturnBookParameters,
} from '../../domain/repositories/borrow.repository.interface';

export class ReturnBookUseCase {
  constructor(private readonly borrowRepository: IBorrowRepository) {}

  async execute(parameters: ReturnBookParameters): Promise<BorrowRecord> {
    if (!parameters.memberCode?.trim()) {
      throw new Error('Member code is required');
    }
    if (!parameters.bookCode?.trim()) {
      throw new Error('Book code is required');
    }

    return this.borrowRepository.returnBook({
      memberCode: parameters.memberCode.trim(),
      bookCode: parameters.bookCode.trim(),
    });
  }
}
