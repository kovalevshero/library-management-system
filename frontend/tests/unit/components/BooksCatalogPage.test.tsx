import { render, screen } from '@testing-library/react';
import { BooksCatalogPage } from '../../../src/presentation/pages/BooksCatalogPage';
import { Book } from '../../../src/domain/entities/book.entity';
import { Member } from '../../../src/domain/entities/member.entity';

describe('BooksCatalogPage Component', () => {
  const mockBooks: Book[] = [
    new Book({
      code: 'JK-45',
      title: 'Harry Potter',
      author: 'J.K Rowling',
      stock: 1,
      availableStock: 1,
    }),
    new Book({
      code: 'TW-11',
      title: 'Twilight',
      author: 'Stephenie Meyer',
      stock: 1,
      availableStock: 0,
    }),
  ];

  const mockMembers: Member[] = [
    new Member({
      code: 'M001',
      name: 'Angga',
      borrowedBooksCount: 0,
      isPenalized: false,
      penaltyUntil: null,
    }),
  ];

  const defaultProps = {
    books: mockBooks,
    allBooks: mockBooks,
    members: mockMembers,
    loading: false,
    error: null,
    searchQuery: '',
    setSearchQuery: jest.fn(),
    inStockOnly: false,
    setInStockOnly: jest.fn(),
    onRefresh: jest.fn(),
    onBorrowBook: jest.fn().mockResolvedValue(true),
    submittingBorrow: false,
    stats: {
      totalTitles: 2,
      totalStock: 2,
      availableStock: 1,
      borrowedStock: 1,
    },
  };

  it('renders book titles, codes, and author information', () => {
    render(<BooksCatalogPage {...defaultProps} />);

    expect(screen.getByText('Harry Potter')).toBeInTheDocument();
    expect(screen.getByText('JK-45')).toBeInTheDocument();
    expect(screen.getByText('J.K Rowling')).toBeInTheDocument();

    expect(screen.getByText('Twilight')).toBeInTheDocument();
    expect(screen.getByText('TW-11')).toBeInTheDocument();
  });

  it('disables borrow button when availableStock is 0', () => {
    render(<BooksCatalogPage {...defaultProps} />);

    const borrowButtons = screen.getAllByRole('button', { name: /Borrow/i });
    // First button is header "Borrow a Book"
    // Next buttons correspond to the table rows
    const hpRowBorrowBtn = borrowButtons.find(
      (btn) => !btn.textContent?.includes('Borrow a Book') && !btn.hasAttribute('disabled')
    );
    const twilightRowBorrowBtn = borrowButtons.find(
      (btn) => !btn.textContent?.includes('Borrow a Book') && btn.hasAttribute('disabled')
    );

    expect(hpRowBorrowBtn).toBeDefined();
    expect(twilightRowBorrowBtn).toBeDefined();
    expect(twilightRowBorrowBtn).toBeDisabled();
  });
});
