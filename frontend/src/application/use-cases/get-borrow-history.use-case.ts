import {
  GetBorrowHistoryParameters,
  IBorrowRepository,
  PaginatedBorrowHistory,
} from '../../domain/repositories/borrow.repository.interface';

export class GetBorrowHistoryUseCase {
  constructor(private readonly borrowRepository: IBorrowRepository) {}

  // Retrieves paginated transaction logs (borrowed & returned) from the backend
  async execute(parameters?: GetBorrowHistoryParameters): Promise<PaginatedBorrowHistory> {
    return this.borrowRepository.getBorrowHistory(parameters);
  }
}
