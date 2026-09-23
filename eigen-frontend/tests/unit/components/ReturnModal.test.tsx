import { render, screen, waitFor } from '@testing-library/react';
import { ReturnModal } from '../../../src/presentation/components/ReturnModal';
import { Book } from '../../../src/domain/entities/book.entity';
import { Member } from '../../../src/domain/entities/member.entity';
import { BorrowRecord } from '../../../src/domain/entities/borrow-record.entity';
import { GetMemberLoansUseCase } from '../../../src/application/use-cases/get-member-loans.use-case';

describe('ReturnModal Component', () => {
  const mockBooks: Book[] = [
    new Book({
      code: 'JK-45',
      title: 'Harry Potter',
      author: 'J.K Rowling',
      stock: 1,
      availableStock: 0,
    }),
    new Book({
      code: 'TW-11',
      title: 'Twilight',
      author: 'Stephenie Meyer',
      stock: 1,
      availableStock: 1,
    }),
    new Book({
      code: 'HOB-83',
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      stock: 1,
      availableStock: 1,
    }),
  ];

  const mockMembers: Member[] = [
    new Member({
      code: 'M001',
      name: 'Angga',
      borrowedBooksCount: 1,
      isPenalized: false,
      penaltyUntil: null,
    }),
    new Member({
      code: 'M002',
      name: 'Ferry',
      borrowedBooksCount: 0,
      isPenalized: false,
      penaltyUntil: null,
    }),
  ];

  it('displays only books currently borrowed by the selected member in the return dropdown', async () => {
    const mockLoans: BorrowRecord[] = [
      new BorrowRecord({
        id: 'rec-1',
        memberCode: 'M001',
        bookCode: 'JK-45',
        borrowedAt: '2026-09-20T10:00:00.000Z',
        status: 'BORROWED',
      }),
    ];

    const mockGetMemberLoansUseCase = {
      execute: jest.fn().mockResolvedValue(mockLoans),
    } as unknown as GetMemberLoansUseCase;

    render(
      <ReturnModal
        open={true}
        onCancel={jest.fn()}
        onSubmit={jest.fn().mockResolvedValue(true)}
        books={mockBooks}
        members={mockMembers}
        initialMemberCode="M001"
        submitting={false}
        getMemberLoansUseCase={mockGetMemberLoansUseCase}
      />
    );

    // Wait for the active loans to be fetched
    await waitFor(() => {
      expect(mockGetMemberLoansUseCase.execute).toHaveBeenCalledWith('M001');
    });

    // Check that Angga's borrowed books alert is displayed
    expect(await screen.findByText(/Angga's Borrowed Books \(1\)/i)).toBeInTheDocument();

    // Verify Harry Potter is pre-selected or present
    expect(screen.getByText(/Harry Potter/i)).toBeInTheDocument();

    // Verify books NOT borrowed by Angga (Twilight, The Hobbit) are not listed
    expect(screen.queryByText(/Twilight/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/The Hobbit/i)).not.toBeInTheDocument();
  });

  it('shows no active loans warning and disables return button when member has 0 loans', async () => {
    const mockGetMemberLoansUseCase = {
      execute: jest.fn().mockResolvedValue([]),
    } as unknown as GetMemberLoansUseCase;

    render(
      <ReturnModal
        open={true}
        onCancel={jest.fn()}
        onSubmit={jest.fn().mockResolvedValue(true)}
        books={mockBooks}
        members={mockMembers}
        initialMemberCode="M002"
        submitting={false}
        getMemberLoansUseCase={mockGetMemberLoansUseCase}
      />
    );

    await waitFor(() => {
      expect(mockGetMemberLoansUseCase.execute).toHaveBeenCalledWith('M002');
    });

    // Should indicate no active loans
    expect(await screen.findByText(/No Active Loans/i)).toBeInTheDocument();

    // Process Return button should be disabled
    const returnBtn = screen.getByRole('button', { name: /Process Return/i });
    expect(returnBtn).toBeDisabled();
  });
});
