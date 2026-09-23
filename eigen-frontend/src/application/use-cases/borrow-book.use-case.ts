import { BorrowRecord } from '../../domain/entities/borrow-record.entity';
import {
  BorrowBookParameters,
  IBorrowRepository,
} from '../../domain/repositories/borrow.repository.interface';

export class BorrowBookUseCase {
  constructor(private readonly borrowRepository: IBorrowRepository) {}

  async execute(parameters: BorrowBookParameters): Promise<BorrowRecord> {
    if (!parameters.memberCode?.trim()) {
      throw new Error('Member code is required');
    }
    if (!parameters.bookCode?.trim()) {
      throw new Error('Book code is required');
    }

    return this.borrowRepository.borrowBook({
      memberCode: parameters.memberCode.trim(),
      bookCode: parameters.bookCode.trim(),
    });
  }
}
