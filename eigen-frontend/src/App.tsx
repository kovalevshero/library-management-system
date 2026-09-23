import React, { useState } from 'react';
import { ConfigProvider, Layout, Typography } from 'antd';
import { themeConfig } from './presentation/theme/themeConfig';
import { Navbar } from './presentation/components/Navbar';
import { BooksCatalogPage } from './presentation/pages/BooksCatalogPage';
import { MembersPage } from './presentation/pages/MembersPage';
import { BorrowManagementPage } from './presentation/pages/BorrowManagementPage';
import { useBooks } from './presentation/hooks/useBooks';
import { useMembers } from './presentation/hooks/useMembers';
import { useBorrowOperations } from './presentation/hooks/useBorrowOperations';

const { Content, Footer } = Layout;
const { Text } = Typography;

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('books');

  const booksState = useBooks();
  const membersState = useMembers();

  const handleTransactionSuccess = () => {
    booksState.refresh();
    membersState.refresh();
  };

  const borrowOperations = useBorrowOperations({
    onSuccess: handleTransactionSuccess,
  });

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Navbar currentTab={currentTab} onTabChange={setCurrentTab} />

        <Content style={{ padding: '0 16px', flex: 1 }}>
          {currentTab === 'books' && (
            <BooksCatalogPage
              books={booksState.books}
              allBooks={booksState.allBooks}
              members={membersState.allMembers}
              loading={booksState.loading}
              error={booksState.error}
              searchQuery={booksState.searchQuery}
              setSearchQuery={booksState.setSearchQuery}
              inStockOnly={booksState.inStockOnly}
              setInStockOnly={booksState.setInStockOnly}
              onRefresh={booksState.refresh}
              onBorrowBook={async (m, b) => Boolean(await borrowOperations.borrowBook(m, b))}
              submittingBorrow={borrowOperations.submitting}
              stats={booksState.stats}
            />
          )}

          {currentTab === 'members' && (
            <MembersPage
              members={membersState.members}
              allMembers={membersState.allMembers}
              books={booksState.allBooks}
              loading={membersState.loading}
              error={membersState.error}
              searchQuery={membersState.searchQuery}
              setSearchQuery={membersState.setSearchQuery}
              penalizedOnly={membersState.penalizedOnly}
              setPenalizedOnly={membersState.setPenalizedOnly}
              onRefresh={membersState.refresh}
              onBorrowBook={async (m, b) => Boolean(await borrowOperations.borrowBook(m, b))}
              onReturnBook={async (m, b) => Boolean(await borrowOperations.returnBook(m, b))}
              submittingBorrow={borrowOperations.submitting}
              submittingReturn={borrowOperations.submitting}
              stats={membersState.stats}
            />
          )}

          {currentTab === 'operations' && (
            <BorrowManagementPage
              books={booksState.allBooks}
              members={membersState.allMembers}
              onBorrowBook={borrowOperations.borrowBook}
              onReturnBook={borrowOperations.returnBook}
              submitting={borrowOperations.submitting}
              lastRecord={borrowOperations.lastRecord}
            />
          )}
        </Content>

        <Footer
          style={{
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '16px 24px',
          }}
        >
          <Text type="secondary" style={{ fontSize: 13 }}>
            Library Management System • Clean Architecture with React, TypeScript & Ant Design
          </Text>
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default App;
