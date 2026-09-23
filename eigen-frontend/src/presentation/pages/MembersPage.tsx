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
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Member } from '../../domain/entities/member.entity';
import { Book } from '../../domain/entities/book.entity';
import { StatCard } from '../components/StatCard';
import { BorrowModal } from '../components/BorrowModal';
import { ReturnModal } from '../components/ReturnModal';

const { Title, Text } = Typography;

export interface MembersPageProps {
  members: Member[];
  allMembers: Member[];
  books: Book[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  penalizedOnly: boolean;
  setPenalizedOnly: (val: boolean) => void;
  onRefresh: () => void;
  onBorrowBook: (memberCode: string, bookCode: string) => Promise<boolean>;
  onReturnBook: (memberCode: string, bookCode: string) => Promise<boolean>;
  submittingBorrow: boolean;
  submittingReturn: boolean;
  stats: {
    totalMembers: number;
    activeBorrowers: number;
    penalizedMembers: number;
  };
}

export const MembersPage: React.FC<MembersPageProps> = ({
  members,
  allMembers,
  books,
  loading,
  error,
  searchQuery,
  setSearchQuery,
  penalizedOnly,
  setPenalizedOnly,
  onRefresh,
  onBorrowBook,
  onReturnBook,
  submittingBorrow,
  submittingReturn,
  stats,
}) => {
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedMemberCode, setSelectedMemberCode] = useState<string | undefined>(undefined);

  const handleOpenBorrow = (memberCode: string) => {
    setSelectedMemberCode(memberCode);
    setBorrowModalOpen(true);
  };

  const handleOpenReturn = (memberCode: string) => {
    setSelectedMemberCode(memberCode);
    setReturnModalOpen(true);
  };

  const columns: ColumnsType<Member> = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 110,
      render: (code: string) => (
        <Text strong style={{ fontFamily: 'monospace', color: '#1e293b' }}>
          {code}
        </Text>
      ),
    },
    {
      title: 'Full Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Text strong style={{ color: '#0f172a' }}>
          {name}
        </Text>
      ),
    },
    {
      title: 'Active Loans',
      dataIndex: 'borrowedBooksCount',
      key: 'borrowedBooksCount',
      width: 140,
      align: 'center',
      render: (count: number) => {
        const isAtLimit = count >= Member.MAX_BORROW_LIMIT;
        return (
          <Tag color={isAtLimit ? 'warning' : count > 0 ? 'blue' : 'default'}>
            {count} / {Member.MAX_BORROW_LIMIT} books
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      width: 220,
      render: (_, record: Member) => {
        if (record.isPenalized) {
          const expiryStr = record.penaltyUntil
            ? `until ${new Date(record.penaltyUntil).toLocaleDateString()}`
            : 'Active';
          return (
            <Tooltip title={`Penalty active ${expiryStr}. Member cannot borrow.`}>
              <Tag color="error">Penalized ({expiryStr})</Tag>
            </Tooltip>
          );
        }
        if (record.borrowedBooksCount >= Member.MAX_BORROW_LIMIT) {
          return <Tag color="warning">Limit Reached</Tag>;
        }
        return <Tag color="success">Eligible to Borrow</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      align: 'right',
      render: (_, record: Member) => (
        <Space size="small">
          <Tooltip title={record.borrowDisallowedReason || 'Issue new book loan'}>
            <Button
              size="small"
              type="primary"
              disabled={!record.canBorrow}
              onClick={() => handleOpenBorrow(record.code)}
            >
              Loan
            </Button>
          </Tooltip>
          <Button
            size="small"
            disabled={record.borrowedBooksCount === 0}
            onClick={() => handleOpenReturn(record.code)}
          >
            Return
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Member Directory
          </Title>
          <Text type="secondary">
            Manage registered library members, monitor active loan quotas, and check penalty status.
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={onRefresh} loading={loading}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<SwapOutlined />}
            onClick={() => handleOpenReturn(allMembers[0]?.code)}
            disabled={allMembers.every((m) => m.borrowedBooksCount === 0)}
          >
            Process Return
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <StatCard title="Total Members" value={stats.totalMembers} subtitle="Registered library patrons" />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard
            title="Active Borrowers"
            value={stats.activeBorrowers}
            subtitle="Holding at least 1 book"
            accentColor="#1d4ed8"
          />
        </Col>
        <Col xs={12} sm={8}>
          <StatCard
            title="Penalized Members"
            value={stats.penalizedMembers}
            subtitle="Borrow privileges suspended"
            accentColor={stats.penalizedMembers > 0 ? '#b91c1c' : '#15803d'}
          />
        </Col>
      </Row>

      {error && (
        <Alert
          type="error"
          showIcon
          message="Members Loading Failed"
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
            placeholder="Search by member name or code..."
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: 360 }}
            allowClear
          />

          <Space size="middle">
            <Space align="center" size="small">
              <Switch checked={penalizedOnly} onChange={setPenalizedOnly} id="penalty-filter" />
              <label htmlFor="penalty-filter" style={{ cursor: 'pointer', fontSize: 14 }}>
                Penalized only
              </label>
            </Space>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Showing {members.length} of {allMembers.length} members
            </Text>
          </Space>
        </div>

        <Table
          rowKey="code"
          columns={columns}
          dataSource={members}
          loading={loading}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          locale={{
            emptyText: (
              <div style={{ padding: '32px 0', textAlign: 'center' }}>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>
                  No members found
                </Text>
                <Text type="secondary">
                  {searchQuery || penalizedOnly
                    ? 'No members match the current filters.'
                    : 'No members are currently registered in the database.'}
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
        books={books}
        members={allMembers}
        initialMemberCode={selectedMemberCode}
        submitting={submittingBorrow}
      />

      <ReturnModal
        open={returnModalOpen}
        onCancel={() => setReturnModalOpen(false)}
        onSubmit={async (memberCode, bookCode) => {
          const res = await onReturnBook(memberCode, bookCode);
          return Boolean(res);
        }}
        books={books}
        members={allMembers}
        initialMemberCode={selectedMemberCode}
        submitting={submittingReturn}
      />
    </div>
  );
};
