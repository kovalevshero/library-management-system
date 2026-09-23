import { useState, useEffect, useCallback, useMemo } from 'react';
import { Book } from '../../domain/entities/book.entity';
import { GetBooksUseCase } from '../../application/use-cases/get-books.use-case';
import { services } from '../../infrastructure/di/container';

export function useBooks(useCase: GetBooksUseCase = services.getBooksUseCase) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await useCase.execute();
      setBooks(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to retrieve book catalog';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [useCase]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStock = inStockOnly ? book.isAvailable : true;
      return matchesSearch && matchesStock;
    });
  }, [books, searchQuery, inStockOnly]);

  const totalTitles = books.length;
  const totalStock = books.reduce((acc, curr) => acc + curr.stock, 0);
  const availableStock = books.reduce((acc, curr) => acc + curr.availableStock, 0);
  const borrowedStock = Math.max(0, totalStock - availableStock);

  return {
    books: filteredBooks,
    allBooks: books,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    inStockOnly,
    setInStockOnly,
    refresh: fetchBooks,
    stats: {
      totalTitles,
      totalStock,
      availableStock,
      borrowedStock,
    },
  };
}
