import { BorrowRecord } from '../../src/domain/entities/borrow-record.entity';

describe('BorrowRecord Entity', () => {
  it('should initialize with default BORROWED status', () => {
    const loan = new BorrowRecord({
      id: 'uuid-1',
      memberCode: 'M001',
      bookCode: 'JK-45',
      borrowedAt: new Date('2026-09-01T00:00:00.000Z'),
    });

    expect(loan.id).toBe('uuid-1');
    expect(loan.memberCode).toBe('M001');
    expect(loan.bookCode).toBe('JK-45');
    expect(loan.status).toBe('BORROWED');
    expect(loan.returnedAt).toBeNull();
  });

  it('should correctly flag overdue status based on 7-day rule', () => {
    const borrowedAt = new Date('2026-09-01T00:00:00.000Z');
    const loan = new BorrowRecord({
      id: 'uuid-1',
      memberCode: 'M001',
      bookCode: 'JK-45',
      borrowedAt,
    });

    const daySeven = new Date('2026-09-08T00:00:00.000Z');
    expect(loan.isOverdue(7, daySeven)).toBe(false);

    const dayEight = new Date('2026-09-08T00:00:01.000Z');
    expect(loan.isOverdue(7, dayEight)).toBe(true);
  });

  it('should mark as returned and indicate whether the return was overdue', () => {
    const borrowedAt = new Date('2026-09-01T00:00:00.000Z');
    const loan = new BorrowRecord({
      id: 'uuid-1',
      memberCode: 'M001',
      bookCode: 'JK-45',
      borrowedAt,
    });

    const returnDate = new Date('2026-09-10T00:00:00.000Z');
    const result = loan.markAsReturned(returnDate, 7);

    expect(loan.status).toBe('RETURNED');
    expect(loan.returnedAt).toEqual(returnDate);
    expect(result.wasOverdue).toBe(true);
  });

  it('should throw error when returning an already returned loan', () => {
    const loan = new BorrowRecord({
      id: 'uuid-1',
      memberCode: 'M001',
      bookCode: 'JK-45',
      borrowedAt: new Date(),
    });

    loan.markAsReturned(new Date());
    expect(() => loan.markAsReturned(new Date())).toThrow(
      'This borrow record is already marked as returned',
    );
  });
});
