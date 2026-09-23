import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Alert, Typography, Space } from 'antd';
import { Book } from '../../domain/entities/book.entity';
import { Member } from '../../domain/entities/member.entity';

const { Text } = Typography;

export interface BorrowModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (memberCode: string, bookCode: string) => Promise<boolean>;
  books: Book[];
  members: Member[];
  initialBookCode?: string;
  initialMemberCode?: string;
  submitting: boolean;
}

export const BorrowModal: React.FC<BorrowModalProps> = ({
  open,
  onCancel,
  onSubmit,
  books,
  members,
  initialBookCode,
  initialMemberCode,
  submitting,
}) => {
  const [form] = Form.useForm();
  const [selectedMemberCode, setSelectedMemberCode] = useState<string | undefined>(
    initialMemberCode
  );
  const [selectedBookCode, setSelectedBookCode] = useState<string | undefined>(
    initialBookCode
  );

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        memberCode: initialMemberCode,
        bookCode: initialBookCode,
      });
      setSelectedMemberCode(initialMemberCode);
      setSelectedBookCode(initialBookCode);
    } else {
      form.resetFields();
      setSelectedMemberCode(undefined);
      setSelectedBookCode(undefined);
    }
  }, [open, initialBookCode, initialMemberCode, form]);

  const selectedMember = members.find((m) => m.code === selectedMemberCode);
  const selectedBook = books.find((b) => b.code === selectedBookCode);

  const isMemberPenalized = selectedMember?.isPenalized;
  const isMemberAtLimit = (selectedMember?.borrowedBooksCount ?? 0) >= Member.MAX_BORROW_LIMIT;
  const isBookUnavailable = selectedBook ? selectedBook.availableStock <= 0 : false;

  const canSubmit =
    Boolean(selectedMemberCode && selectedBookCode) &&
    !isMemberPenalized &&
    !isMemberAtLimit &&
    !isBookUnavailable;

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
      title="Borrow Book"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={submitting}
      okButtonProps={{ disabled: !canSubmit }}
      okText="Confirm Loan"
      cancelText="Cancel"
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 16 }}
        onValuesChange={(_, allValues) => {
          setSelectedMemberCode(allValues.memberCode);
          setSelectedBookCode(allValues.bookCode);
        }}
      >
        <Form.Item
          name="memberCode"
          label="Borrower (Member)"
          rules={[{ required: true, message: 'Please select a member' }]}
        >
          <Select
            placeholder="Select a registered member"
            showSearch
            optionFilterProp="label"
            options={members.map((member) => ({
              value: member.code,
              label: `${member.name} (${member.code}) - ${member.borrowedBooksCount}/2 borrowed${
                member.isPenalized ? ' [Penalized]' : ''
              }`,
            }))}
          />
        </Form.Item>

        {selectedMember && (
          <div style={{ marginBottom: 16 }}>
            {isMemberPenalized && (
              <Alert
                type="error"
                showIcon
                message="Member Under Active Penalty"
                description={
                  selectedMember.penaltyUntil
                    ? `Penalty active until ${new Date(selectedMember.penaltyUntil).toLocaleDateString()}. Borrowing is suspended.`
                    : 'This member cannot borrow books while penalized.'
                }
              />
            )}
            {!isMemberPenalized && isMemberAtLimit && (
              <Alert
                type="warning"
                showIcon
                message="Borrowing Limit Reached"
                description={`Member currently holds ${selectedMember.borrowedBooksCount} books. The maximum limit is 2 books.`}
              />
            )}
            {!isMemberPenalized && !isMemberAtLimit && (
              <Alert
                type="success"
                showIcon
                message="Eligible to Borrow"
                description={`Member currently holds ${selectedMember.borrowedBooksCount} of 2 allowable loans.`}
              />
            )}
          </div>
        )}

        <Form.Item
          name="bookCode"
          label="Book to Borrow"
          rules={[{ required: true, message: 'Please select a book' }]}
        >
          <Select
            placeholder="Select an available book"
            showSearch
            optionFilterProp="label"
            options={books.map((book) => ({
              value: book.code,
              disabled: book.availableStock <= 0,
              label: `${book.title} (${book.code}) - ${book.availableStock}/${book.stock} available`,
            }))}
          />
        </Form.Item>

        {selectedBook && (
          <div>
            {isBookUnavailable ? (
              <Alert
                type="warning"
                showIcon
                message="Book Currently Unavailable"
                description="All copies of this title are currently borrowed by other members."
              />
            ) : (
              <Space direction="vertical" size={2}>
                <Text type="secondary">
                  Author: <Text strong>{selectedBook.author}</Text>
                </Text>
                <Text type="secondary">
                  Available Stock: <Text strong>{selectedBook.availableStock}</Text> of {selectedBook.stock}
                </Text>
              </Space>
            )}
          </div>
        )}
      </Form>
    </Modal>
  );
};
