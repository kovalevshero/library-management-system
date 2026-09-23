import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Form,
  Select,
  Button,
  Alert,
  Typography,
  Space,
  Tabs,
  Tag,
  Spin,
} from 'antd';
import {
  BookOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Book } from '../../domain/entities/book.entity';
import { Member } from '../../domain/entities/member.entity';
import { BorrowRecord } from '../../domain/entities/borrow-record.entity';
import { services } from '../../infrastructure/di/container';

const { Title, Text, Paragraph } = Typography;

export interface BorrowManagementPageProps {
  books: Book[];
  members: Member[];
  onBorrowBook: (memberCode: string, bookCode: string) => Promise<BorrowRecord | null>;
  onReturnBook: (memberCode: string, bookCode: string) => Promise<BorrowRecord | null>;
  submitting: boolean;
  lastRecord: BorrowRecord | null;
}

export const BorrowManagementPage: React.FC<BorrowManagementPageProps> = ({
  books,
  members,
  onBorrowBook,
  onReturnBook,
  submitting,
  lastRecord,
}) => {
  const [borrowForm] = Form.useForm();
  const [returnForm] = Form.useForm();
  const [selectedBorrowMember, setSelectedBorrowMember] = useState<Member | null>(null);
  const [selectedBorrowBook, setSelectedBorrowBook] = useState<Book | null>(null);
  const [transactionHistory, setTransactionHistory] = useState<BorrowRecord[]>([]);
  const [historyPage, setHistoryPage] = useState<number>(1);
  const [historyTotal, setHistoryTotal] = useState<number>(0);
  const [hasMoreHistory, setHasMoreHistory] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [loadingMoreHistory, setLoadingMoreHistory] = useState<boolean>(false);

  const [selectedReturnMember, setSelectedReturnMember] = useState<Member | null>(null);
  const [returnMemberLoans, setReturnMemberLoans] = useState<BorrowRecord[]>([]);
  const [loadingReturnLoans, setLoadingReturnLoans] = useState<boolean>(false);
  const [returnLoansError, setReturnLoansError] = useState<string | null>(null);

  const loadInitialHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const result = await services.getBorrowHistoryUseCase.execute({ page: 1, limit: 10 });
      setTransactionHistory(result.records);
      setHistoryPage(1);
      setHistoryTotal(result.total);
      setHasMoreHistory(result.hasMore);
    } catch {
      // Graceful fallback
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const loadMoreHistory = useCallback(async () => {
    if (loadingMoreHistory || !hasMoreHistory) return;
    try {
      setLoadingMoreHistory(true);
      const nextPage = historyPage + 1;
      const result = await services.getBorrowHistoryUseCase.execute({ page: nextPage, limit: 10 });
      setTransactionHistory((prev) => [...prev, ...result.records]);
      setHistoryPage(nextPage);
      setHistoryTotal(result.total);
      setHasMoreHistory(result.hasMore);
    } catch {
      // Graceful fallback
    } finally {
      setLoadingMoreHistory(false);
    }
  }, [loadingMoreHistory, hasMoreHistory, historyPage]);

  useEffect(() => {
    loadInitialHistory();
  }, [loadInitialHistory]);

  const handleHistoryScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      scrollHeight - scrollTop - clientHeight < 40 &&
      hasMoreHistory &&
      !loadingMoreHistory &&
      !loadingHistory
    ) {
      loadMoreHistory();
    }
  };

  const handleReturnMemberChange = async (memberCode: string) => {
    const member = members.find((m) => m.code === memberCode) || null;
    setSelectedReturnMember(member);
    returnForm.setFieldValue('bookCode', undefined);
    if (!memberCode) {
      setReturnMemberLoans([]);
      setReturnLoansError(null);
      return;
    }
    try {
      setLoadingReturnLoans(true);
      setReturnLoansError(null);
      const loans = await services.getMemberLoansUseCase.execute(memberCode);
      setReturnMemberLoans(loans);
      if (loans.length === 1) {
        returnForm.setFieldValue('bookCode', loans[0].bookCode);
      }
    } catch (err) {
      setReturnMemberLoans([]);
      setReturnLoansError(err instanceof Error ? err.message : 'Failed to retrieve active loans');
    } finally {
      setLoadingReturnLoans(false);
    }
  };

  const returnableBooks = useMemo(() => {
    if (!selectedReturnMember) return [];
    const loanedCodes = new Set(returnMemberLoans.map((l) => l.bookCode));
    return books.filter((b) => loanedCodes.has(b.code));
  }, [selectedReturnMember, returnMemberLoans, books]);

  const handleBorrowSubmit = async () => {
    try {
      const values = await borrowForm.validateFields();
      const record = await onBorrowBook(values.memberCode, values.bookCode);
      if (record) {
        borrowForm.resetFields();
        setSelectedBorrowMember(null);
        setSelectedBorrowBook(null);
        await loadInitialHistory();
      }
    } catch {
      // Form validation failed
    }
  };

  const handleReturnSubmit = async () => {
    try {
      const values = await returnForm.validateFields();
      const record = await onReturnBook(values.memberCode, values.bookCode);
      if (record) {
        returnForm.resetFields();
        setSelectedReturnMember(null);
        setReturnMemberLoans([]);
        await loadInitialHistory();
      }
    } catch {
      // Form validation failed
    }
  };

  const canBorrow =
    selectedBorrowMember &&
    selectedBorrowBook &&
    selectedBorrowMember.canBorrow &&
    selectedBorrowBook.isAvailable;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Borrow & Return Operations
        </Title>
        <Text type="secondary">
          Execute book loan transactions and returns with instant policy validation.
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card
            style={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: 'none' }}
            styles={{ body: { padding: '24px' } }}
          >
            <Tabs
              defaultActiveKey="borrow"
              items={[
                {
                  key: 'borrow',
                  label: (
                    <span>
                      <BookOutlined /> Issue Loan
                    </span>
                  ),
                  children: (
                    <Form
                      form={borrowForm}
                      layout="vertical"
                      onValuesChange={(_, all) => {
                        setSelectedBorrowMember(
                          members.find((m) => m.code === all.memberCode) || null
                        );
                        setSelectedBorrowBook(
                          books.find((b) => b.code === all.bookCode) || null
                        );
                      }}
                    >
                      <Form.Item
                        name="memberCode"
                        label="Borrowing Member"
                        rules={[{ required: true, message: 'Please select a member' }]}
                      >
                        <Select
                          placeholder="Select member"
                          showSearch
                          optionFilterProp="label"
                          options={members.map((m) => ({
                            value: m.code,
                            label: `${m.name} (${m.code}) - ${m.borrowedBooksCount}/2 borrowed${
                              m.isPenalized ? ' [Penalized]' : ''
                            }`,
                          }))}
                        />
                      </Form.Item>

                      <Form.Item
                        name="bookCode"
                        label="Book Title"
                        rules={[{ required: true, message: 'Please select a book' }]}
                      >
                        <Select
                          placeholder="Select book to borrow"
                          showSearch
                          optionFilterProp="label"
                          options={books.map((b) => ({
                            value: b.code,
                            disabled: b.availableStock <= 0,
                            label: `${b.title} (${b.code}) - ${b.availableStock}/${b.stock} available`,
                          }))}
                        />
                      </Form.Item>

                      <div
                        style={{
                          backgroundColor: '#f8fafc',
                          padding: 16,
                          borderRadius: 6,
                          border: '1px solid #e2e8f0',
                          marginBottom: 20,
                        }}
                      >
                        <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                          Policy Requirements:
                        </Text>
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <Text
                            style={{
                              fontSize: 13,
                              color:
                                selectedBorrowMember &&
                                selectedBorrowMember.borrowedBooksCount >= Member.MAX_BORROW_LIMIT
                                  ? '#b91c1c'
                                  : '#334155',
                            }}
                          >
                            • Member may not borrow more than 2 books ({selectedBorrowMember?.borrowedBooksCount ?? 0} currently held)
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              color:
                                selectedBorrowBook && !selectedBorrowBook.isAvailable
                                  ? '#b91c1c'
                                  : '#334155',
                            }}
                          >
                            • Book must have available stock ({selectedBorrowBook?.availableStock ?? '-'} available)
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              color:
                                selectedBorrowMember?.isPenalized ? '#b91c1c' : '#334155',
                            }}
                          >
                            • Member must not be penalized ({selectedBorrowMember?.isPenalized ? 'Penalized' : 'Clear'})
                          </Text>
                        </Space>
                      </div>

                      <Button
                        type="primary"
                        onClick={handleBorrowSubmit}
                        loading={submitting}
                        disabled={!canBorrow}
                        block
                        size="large"
                      >
                        Confirm Borrow Loan
                      </Button>
                    </Form>
                  ),
                },
                {
                  key: 'return',
                  label: (
                    <span>
                      <SwapOutlined /> Process Return
                    </span>
                  ),
                  children: (
                    <Form form={returnForm} layout="vertical">
                      <Form.Item
                        name="memberCode"
                        label="Returning Member"
                        rules={[{ required: true, message: 'Please select a member' }]}
                      >
                        <Select
                          placeholder="Select member"
                          showSearch
                          optionFilterProp="label"
                          onChange={handleReturnMemberChange}
                          options={members.map((m) => ({
                            value: m.code,
                            label: `${m.name} (${m.code}) - ${m.borrowedBooksCount} active loans`,
                          }))}
                        />
                      </Form.Item>

                      {selectedReturnMember && (
                        <div style={{ marginBottom: 16 }}>
                          {loadingReturnLoans ? (
                            <div style={{ textAlign: 'center', padding: '8px 0' }}>
                              <Spin size="small" />{' '}
                              <Text type="secondary" style={{ marginLeft: 8 }}>
                                Checking active loans...
                              </Text>
                            </div>
                          ) : returnLoansError ? (
                            <Alert
                              type="error"
                              showIcon
                              message="Error Loading Active Loans"
                              description={returnLoansError}
                              action={
                                <Button
                                  size="small"
                                  onClick={() => handleReturnMemberChange(selectedReturnMember.code)}
                                >
                                  Retry
                                </Button>
                              }
                            />
                          ) : returnableBooks.length === 0 ? (
                            <Alert
                              type="warning"
                              showIcon
                              message="No Active Loans"
                              description={`${selectedReturnMember.name} currently has no borrowed books to return.`}
                            />
                          ) : (
                            <Alert
                              type="info"
                              showIcon
                              message={`${selectedReturnMember.name}'s Borrowed Books (${returnableBooks.length})`}
                              description="Select the book being returned from this member's active loans."
                            />
                          )}
                        </div>
                      )}

                      <Form.Item
                        name="bookCode"
                        label="Book Being Returned"
                        rules={[{ required: true, message: 'Please select a book to return' }]}
                      >
                        <Select
                          placeholder={
                            !selectedReturnMember
                              ? 'Select a member first'
                              : returnableBooks.length === 0
                              ? 'No books available to return'
                              : 'Select borrowed book'
                          }
                          disabled={!selectedReturnMember || loadingReturnLoans || returnableBooks.length === 0}
                          loading={loadingReturnLoans}
                          showSearch
                          optionFilterProp="label"
                          options={returnableBooks.map((b) => ({
                            value: b.code,
                            label: `${b.title} (${b.code})`,
                          }))}
                        />
                      </Form.Item>

                      <Alert
                        type="warning"
                        showIcon
                        message="Late Return Penalty Policy"
                        description="If the book is returned after more than 7 days, a 3-day penalty is automatically assigned. The member cannot borrow books during this period."
                        style={{ marginBottom: 20 }}
                      />

                      <Button
                        type="primary"
                        onClick={handleReturnSubmit}
                        loading={submitting}
                        disabled={!selectedReturnMember || returnableBooks.length === 0}
                        block
                        size="large"
                      >
                        Complete Book Return
                      </Button>
                    </Form>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title="Recent Activity"
            extra={
              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined spin={loadingHistory} />}
                onClick={loadInitialHistory}
                disabled={loadingHistory}
                style={{ fontSize: 12, color: '#64748b' }}
              >
                Refresh
              </Button>
            }
            style={{ borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: 'none' }}
            styles={{ body: { padding: '20px' } }}
          >
            {lastRecord && (
              <div
                style={{
                  backgroundColor: lastRecord.penaltyApplied ? '#fffbeb' : '#f0fdf4',
                  border: `1px solid ${lastRecord.penaltyApplied ? '#fcd34d' : '#86efac'}`,
                  borderRadius: 6,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <CheckCircleOutlined
                    style={{ color: lastRecord.penaltyApplied ? '#b45309' : '#15803d' }}
                  />
                  <Text strong>
                    Latest: {lastRecord.status === 'BORROWED' ? 'Loan Issued' : 'Return Processed'}
                  </Text>
                </div>
                <Paragraph style={{ margin: 0, fontSize: 13, color: '#334155' }}>
                  Member: <Text strong>{lastRecord.memberCode}</Text> • Book:{' '}
                  <Text strong>{lastRecord.bookCode}</Text>
                </Paragraph>
                {lastRecord.penaltyApplied && (
                  <Tag color="error" style={{ marginTop: 8 }}>
                    3-Day Penalty Applied
                  </Tag>
                )}
              </div>
            )}

            {loadingHistory && transactionHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0' }}>
                <Spin size="default" />
                <Text type="secondary" style={{ display: 'block', marginTop: 12, fontSize: 13 }}>
                  Loading transaction history...
                </Text>
              </div>
            ) : transactionHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0' }}>
                <InfoCircleOutlined style={{ fontSize: 24, color: '#94a3b8', marginBottom: 8 }} />
                <Text type="secondary" style={{ display: 'block' }}>
                  No transaction logs recorded in the system yet.
                </Text>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 10,
                  }}
                >
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Database transaction log:
                  </Text>
                  <Tag style={{ fontSize: 11, borderRadius: 10, margin: 0 }}>
                    {transactionHistory.length} of {historyTotal}
                  </Tag>
                </div>

                <div
                  onScroll={handleHistoryScroll}
                  style={{
                    maxHeight: 380,
                    overflowY: 'auto',
                    paddingRight: 6,
                  }}
                >
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {transactionHistory.map((rec) => {
                      const eventDate = rec.returnedAt ? new Date(rec.returnedAt) : new Date(rec.borrowedAt);
                      return (
                        <div
                          key={rec.id}
                          style={{
                            padding: '10px 12px',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderRadius: 4,
                            backgroundColor: '#ffffff',
                          }}
                        >
                          <div>
                            <Text strong style={{ fontSize: 13 }}>
                              {rec.memberCode} ↔ {rec.bookCode}
                            </Text>
                            <Text
                              type="secondary"
                              style={{ fontSize: 11, display: 'block', marginTop: 2 }}
                            >
                              {eventDate.toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}{' '}
                              • {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </div>
                          <Tag color={rec.status === 'BORROWED' ? 'blue' : 'green'}>
                            {rec.status}
                          </Tag>
                        </div>
                      );
                    })}
                  </Space>

                  {loadingMoreHistory && (
                    <div style={{ textAlign: 'center', padding: '14px 0' }}>
                      <Spin size="small" />
                      <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                        Loading more activity...
                      </Text>
                    </div>
                  )}

                  {hasMoreHistory && !loadingMoreHistory && (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                      <Button
                        type="dashed"
                        size="small"
                        onClick={loadMoreHistory}
                        block
                        style={{ fontSize: 12, color: '#475569' }}
                      >
                        Load more transactions ({historyTotal - transactionHistory.length} remaining)
                      </Button>
                    </div>
                  )}

                  {!hasMoreHistory && transactionHistory.length > 0 && (
                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                      <Text type="secondary" style={{ fontSize: 11, color: '#94a3b8' }}>
                        All {historyTotal} transactions loaded
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
