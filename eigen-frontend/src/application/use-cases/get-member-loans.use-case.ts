import { BorrowRecord } from '../../domain/entities/borrow-record.entity';
import { IBorrowRepository } from '../../domain/repositories/borrow.repository.interface';

export class GetMemberLoansUseCase {
  constructor(private readonly borrowRepository: IBorrowRepository) {}

  // Retrieves active book loans currently held by a member
  async execute(memberCode: string): Promise<BorrowRecord[]> {
    if (!memberCode?.trim()) {
      return [];
    }
    return this.borrowRepository.getActiveLoansByMember(memberCode.trim());
  }
}
