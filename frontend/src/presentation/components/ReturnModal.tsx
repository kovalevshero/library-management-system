import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Modal, Form, Select, Alert, Typography, Spin, Button } from 'antd';
import { Book } from '../../domain/entities/book.entity';
import { Member } from '../../domain/entities/member.entity';
import { BorrowRecord } from '../../domain/entities/borrow-record.entity';
import { GetMemberLoansUseCase } from '../../application/use-cases/get-member-loans.use-case';
import { services } from '../../infrastructure/di/container';

const { Text } = Typography;

export interface ReturnModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (memberCode: string, bookCode: string) => Promise<boolean>;
  books: Book[];
  members: Member[];
  initialBookCode?: string;
  initialMemberCode?: string;
  submitting: boolean;
  getMemberLoansUseCase?: GetMemberLoansUseCase;
}

export const ReturnModal: React.FC<ReturnModalProps> = ({
  open,
  onCancel,
  onSubmit,
  books,
  members,
  initialBookCode,
  initialMemberCode,
  submitting,
  getMemberLoansUseCase = services.getMemberLoansUseCase,
}) => {
  const [form] = Form.useForm();
  const [selectedMemberCode, setSelectedMemberCode] = useState<string | undefined>(
    initialMemberCode
  );
  const [memberLoans, setMemberLoans] = useState<BorrowRecord[]>([]);
  const [loadingLoans, setLoadingLoans] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchLoans = useCallback(
    async (memberCode: string) => {
      try {
        setLoadingLoans(true);
        setFetchError(null);
        const loans = await getMemberLoansUseCase.execute(memberCode);
        setMemberLoans(loans);
        return loans;
      } catch (err) {
        setMemberLoans([]);
        const msg = err instanceof Error ? err.message : 'Failed to retrieve active loans';
        setFetchError(msg);
        return [];
      } finally {
        setLoadingLoans(false);
      }
    },
    [getMemberLoansUseCase]
  );

  useEffect(() => {
    if (open) {
      const activeMemberCode = initialMemberCode || undefined;
      setSelectedMemberCode(activeMemberCode);

      form.setFieldsValue({
        memberCode: activeMemberCode,
        bookCode: initialBookCode || undefined,
      });

      if (activeMemberCode) {
        fetchLoans(activeMemberCode).then((loans) => {
          if (initialBookCode && loans.some((l) => l.bookCode === initialBookCode)) {
            form.setFieldValue('bookCode', initialBookCode);
          } else if (loans.length === 1) {
            form.setFieldValue('bookCode', loans[0].bookCode);
          }
        });
      } else {
        setMemberLoans([]);
      }
    } else {
      form.resetFields();
      setSelectedMemberCode(undefined);
      setMemberLoans([]);
    }
  }, [open, initialBookCode, initialMemberCode, form, fetchLoans]);

  const handleMemberChange = async (memberCode: string) => {
    setSelectedMemberCode(memberCode);
    form.setFieldValue('bookCode', undefined);
    const loans = await fetchLoans(memberCode);
    if (loans.length === 1) {
      form.setFieldValue('bookCode', loans[0].bookCode);
    }
  };

  const selectedMember = members.find((m) => m.code === selectedMemberCode);

  const returnableBooks = useMemo(() => {
    if (!selectedMemberCode) return [];
    const loanedCodes = new Set(memberLoans.map((l) => l.bookCode));
    return books.filter((b) => loanedCodes.has(b.code));
  }, [selectedMemberCode, memberLoans, books]);

  const hasNoActiveLoans = selectedMember && !loadingLoans && memberLoans.length === 0;

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const success = await onSubmit(values.memberCode, values.bookCode);
      if (success) {
        form.resetFields();
        onCancel();
      }
    } catch {
      // Form validation failed
    }
  };

  return (
    <Modal
      title="Return Book"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={submitting}
      okButtonProps={{ disabled: hasNoActiveLoans || returnableBooks.length === 0 }}
      okText="Process Return"
      cancelText="Cancel"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="memberCode"
          label="Returning Member"
          rules={[{ required: true, message: 'Please select a member' }]}
        >
          <Select
            placeholder="Select member returning the book"
            showSearch
            optionFilterProp="label"
            onChange={handleMemberChange}
            options={members.map((member) => ({
              value: member.code,
              label: `${member.name} (${member.code}) - ${member.borrowedBooksCount} active loans`,
            }))}
          />
        </Form.Item>

        {selectedMember && (
          <div style={{ marginBottom: 16 }}>
            {loadingLoans ? (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <Spin size="small" />{' '}
                <Text type="secondary" style={{ marginLeft: 8 }}>
                  Checking active loans...
                </Text>
              </div>
            ) : fetchError ? (
              <Alert
                type="error"
                showIcon
                message="Error Loading Active Loans"
                description={fetchError}
                action={
                  <Button size="small" onClick={() => fetchLoans(selectedMemberCode!)}>
                    Retry
                  </Button>
                }
              />
            ) : hasNoActiveLoans ? (
              <Alert
                type="warning"
                showIcon
                message="No Active Loans"
                description={`${selectedMember.name} currently has no borrowed books to return.`}
              />
            ) : (
              <Alert
                type="info"
                showIcon
                message={`${selectedMember.name}'s Borrowed Books (${returnableBooks.length})`}
                description="Select which of the borrowed books is being returned below."
              />
            )}
          </div>
        )}

        <Form.Item
          name="bookCode"
          label="Book to Return"
          rules={[{ required: true, message: 'Please select a book to return' }]}
        >
          <Select
            placeholder={
              !selectedMemberCode
                ? 'Select a member first'
                : hasNoActiveLoans
                ? 'No books available to return'
                : 'Select the borrowed book being returned'
            }
            disabled={!selectedMemberCode || hasNoActiveLoans || loadingLoans}
            loading={loadingLoans}
            showSearch
            optionFilterProp="label"
            options={returnableBooks.map((book) => ({
              value: book.code,
              label: `${book.title} (${book.code})`,
            }))}
          />
        </Form.Item>

        <Alert
          type="info"
          showIcon
          message="Loan Policy Reminder"
          description={
            <Text type="secondary" style={{ fontSize: 13 }}>
              Books returned after more than 7 days from borrow date will incur an automatic 3-day penalty, suspending borrowing privileges.
            </Text>
          }
        />
      </Form>
    </Modal>
  );
};
