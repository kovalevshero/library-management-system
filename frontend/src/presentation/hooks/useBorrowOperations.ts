import { useState, useCallback } from 'react';
import { message } from 'antd';
import { BorrowBookUseCase } from '../../application/use-cases/borrow-book.use-case';
import { ReturnBookUseCase } from '../../application/use-cases/return-book.use-case';
import { BorrowRecord } from '../../domain/entities/borrow-record.entity';
import { services } from '../../infrastructure/di/container';

export interface UseBorrowOperationsOptions {
  borrowUseCase?: BorrowBookUseCase;
  returnUseCase?: ReturnBookUseCase;
  onSuccess?: () => void;
}

export function useBorrowOperations(options: UseBorrowOperationsOptions = {}) {
  const borrowUseCase = options.borrowUseCase || services.borrowBookUseCase;
  const returnUseCase = options.returnUseCase || services.returnBookUseCase;

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [lastRecord, setLastRecord] = useState<BorrowRecord | null>(null);

  const borrowBook = useCallback(
    async (memberCode: string, bookCode: string): Promise<BorrowRecord | null> => {
      try {
        setSubmitting(true);
        setOperationError(null);
        const record = await borrowUseCase.execute({ memberCode, bookCode });
        setLastRecord(record);
        message.success(`Book ${bookCode} successfully borrowed for member ${memberCode}`);
        options.onSuccess?.();
        return record;
      } catch (err) {
        const errorText = err instanceof Error ? err.message : 'Failed to complete borrow transaction';
        setOperationError(errorText);
        message.error(errorText);
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [borrowUseCase, options]
  );

  const returnBook = useCallback(
    async (memberCode: string, bookCode: string): Promise<BorrowRecord | null> => {
      try {
        setSubmitting(true);
        setOperationError(null);
        const record = await returnUseCase.execute({ memberCode, bookCode });
        setLastRecord(record);

        if (record.penaltyApplied) {
          const penaltyMsg = record.penaltyUntil
            ? ` Book returned overdue. 3-day penalty applied until ${new Date(record.penaltyUntil).toLocaleDateString()}.`
            : ' Book returned overdue. A 3-day penalty was applied.';
          message.warning(`Book ${bookCode} returned.${penaltyMsg}`, 6);
        } else {
          message.success(`Book ${bookCode} successfully returned for member ${memberCode}`);
        }

        options.onSuccess?.();
        return record;
      } catch (err) {
        const errorText = err instanceof Error ? err.message : 'Failed to return book';
        setOperationError(errorText);
        message.error(errorText);
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [returnUseCase, options]
  );

  return {
    borrowBook,
    returnBook,
    submitting,
    operationError,
    lastRecord,
    clearError: () => setOperationError(null),
  };
}
