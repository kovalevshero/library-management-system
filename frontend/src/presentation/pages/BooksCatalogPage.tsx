import React, { useState } from 'react';
import {
  Table,
  Input,
  Switch,
  Button,
  Tag,
  Space,
  Row,
  Col,
  Alert,
  Typography,
  Card,
} from 'antd';
import { SearchOutlined, ReloadOutlined, BookOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Book } from '../../domain/entities/book.entity';
import { Member } from '../../domain/entities/member.entity';
import { StatCard } from '../components/StatCard';
import { BorrowModal } from '../components/BorrowModal';

const { Title, Text } = Typography;

export interface BooksCatalogPageProps {
  books: Book[];
  allBooks: Book[];
  members: Member[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  onRefresh: () => void;
  onBorrowBook: (memberCode: string, bookCode: string) => Promise<boolean>;
  submittingBorrow: boolean;
  stats: {
    totalTitles: number;
    totalStock: number;
    availableStock: number;
    borrowedStock: number;
  };
}

export const BooksCatalogPage: React.FC<BooksCatalogPageProps> = ({
  books,
  allBooks,
  members,
  loading,
  error,
  searchQuery,
  setSearchQuery,
  inStockOnly,
  setInStockOnly,
  onRefresh,
  onBorrowBook,
  submittingBorrow,
  stats,
}) => {
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [selectedBookCode, setSelectedBookCode] = useState<string | undefined>(undefined);

  const handleOpenBorrow = (bookCode?: string) => {
    setSelectedBookCode(bookCode);
    setBorrowModalOpen(true);
  };

  const columns: ColumnsType<Book> = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => (
        <Text strong style={{ fontFamily: 'monospace', color: '#1e293b' }}>
          {code}
        </Text>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => (
        <Text strong style={{ color: '#0f172a' }}>
          {title}
        </Text>
      ),
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      render: (author: string) => <Text style={{ color: '#475569' }}>{author}</Text>,
    },
    {
      title: 'Total Stock',
      dataIndex: 'stock',
      key: 'stock',
      width: 120,
      align: 'center',
      render: (stock: number) => <Text>{stock}</Text>,
    },
    {
      title: 'Available',
      dataIndex: 'availableStock',
      key: 'availableStock',
      width: 140,
      align: 'center',
      render: (availableStock: number, record: Book) => {
        if (availableStock > 0) {
          return (
            <Tag color="success">
              {availableStock} in stock
            </Tag>
          );
        }
        return (
          <Tag color="default">
            Loaned ({record.borrowedCount})
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 130,
      align: 'right',
      render: (_, record: Book) => (
        <Button
          type="primary"
          size="small"
          disabled={!record.isAvailable}
          onClick={() => handleOpenBorrow(record.code)}
        >
          Borrow
        </Button>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Book Catalog
          </Title>
          <Text type="secondary">
            View all registered books, inventory counts, and initiate loans for members.
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<BookOutlined />}
            onClick={() => handleOpenBorrow()}
          >
            Borrow a Book
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <StatCard title="Total Titles" value={stats.totalTitles} subtitle="Unique catalog entries" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard title="Total Inventory" value={stats.totalStock} subtitle="Combined physical copies" />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Available Now"
            value={stats.availableStock}
            subtitle="Ready to loan"
            accentColor="#15803d"
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            title="Active Loans"
            value={stats.borrowedStock}
            subtitle="Currently with members"
            accentColor="#b45309"
          />
        </Col>
      </Row>

      {error && (
        <Alert
          type="error"
          showIcon
          message="Catalog Loading Failed"
          description={error}
          action={
            <Button size="small" onClick={onRefresh}>
              Retry
            </Button>
          }
          style={{ marginBottom: 20 }}
        />
      )}

      <Card
        styles={{ body: { padding: '20px' } }}
        style={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: 'none' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <Input
            placeholder="Search by title, author, or code..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: 360 }}
            allowClear
          />

          <Space size="middle">
            <Space align="center" size="small">
              <Switch checked={inStockOnly} onChange={setInStockOnly} id="stock-filter" />
              <label htmlFor="stock-filter" style={{ cursor: 'pointer', fontSize: 14 }}>
                Available only
              </label>
            </Space>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Showing {books.length} of {allBooks.length} titles
            </Text>
          </Space>
        </div>

        <Table
          rowKey="code"
          columns={columns}
          dataSource={books}
          loading={loading}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          locale={{
            emptyText: (
              <div style={{ padding: '32px 0', textAlign: 'center' }}>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                  No books found
                </Text>
                <Text type="secondary">
                  {searchQuery || inStockOnly
                    ? 'Try adjusting your search query or availability filter.'
                    : 'The library catalog is currently empty.'}
                </Text>
              </div>
            ),
          }}
        />
      </Card>

      <BorrowModal
        open={borrowModalOpen}
        onCancel={() => setBorrowModalOpen(false)}
        onSubmit={async (memberCode, bookCode) => {
          const res = await onBorrowBook(memberCode, bookCode);
          return Boolean(res);
        }}
        books={allBooks}
        members={members}
        initialBookCode={selectedBookCode}
        submitting={submittingBorrow}
      />
    </div>
  );
};
