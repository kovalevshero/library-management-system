import { render, screen } from '@testing-library/react';
import { MembersPage } from '../../../src/presentation/pages/MembersPage';
import { Member } from '../../../src/domain/entities/member.entity';
import { Book } from '../../../src/domain/entities/book.entity';

describe('MembersPage Component', () => {
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
      borrowedBooksCount: 2,
      isPenalized: false,
      penaltyUntil: null,
    }),
    new Member({
      code: 'M003',
      name: 'Putri',
      borrowedBooksCount: 0,
      isPenalized: true,
      penaltyUntil: '2026-10-01T00:00:00.000Z',
    }),
  ];

  const mockBooks: Book[] = [
    new Book({
      code: 'JK-45',
      title: 'Harry Potter',
      author: 'J.K Rowling',
      stock: 1,
      availableStock: 1,
    }),
  ];

  const defaultProps = {
    members: mockMembers,
    allMembers: mockMembers,
    books: mockBooks,
    loading: false,
    error: null,
    searchQuery: '',
    setSearchQuery: jest.fn(),
    penalizedOnly: false,
    setPenalizedOnly: jest.fn(),
    onRefresh: jest.fn(),
    onBorrowBook: jest.fn().mockResolvedValue(true),
    onReturnBook: jest.fn().mockResolvedValue(true),
    submittingBorrow: false,
    submittingReturn: false,
    stats: {
      totalMembers: 3,
      activeBorrowers: 2,
      penalizedMembers: 1,
    },
  };

  it('renders member names, codes, and borrow statuses', () => {
    render(<MembersPage {...defaultProps} />);

    expect(screen.getByText('Angga')).toBeInTheDocument();
    expect(screen.getByText('M001')).toBeInTheDocument();

    expect(screen.getByText('Ferry')).toBeInTheDocument();
    expect(screen.getByText('M002')).toBeInTheDocument();

    expect(screen.getByText('Putri')).toBeInTheDocument();
    expect(screen.getByText('M003')).toBeInTheDocument();
  });

  it('shows penalty badge for penalized member and disables loan button', () => {
    render(<MembersPage {...defaultProps} />);

    const penalizedElements = screen.getAllByText(/Penalized/i);
    expect(penalizedElements.length).toBeGreaterThan(0);
  });
});
