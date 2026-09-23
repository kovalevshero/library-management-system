import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { BookOutlined, UserOutlined, SwapOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

export interface NavbarProps {
  currentTab: string;
  onTabChange: (key: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const menuItems = [
    {
      key: 'books',
      icon: <BookOutlined />,
      label: 'Book Catalog',
    },
    {
      key: 'members',
      icon: <UserOutlined />,
      label: 'Members',
    },
    {
      key: 'operations',
      icon: <SwapOutlined />,
      label: 'Borrow & Return',
    },
  ];

  return (
    <Header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 64,
      }}
    >
      <Title
        level={4}
        style={{
          margin: 0,
          color: '#0f172a',
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        Library Management
      </Title>

      <Menu
        mode="horizontal"
        selectedKeys={[currentTab]}
        onClick={({ key }) => onTabChange(key)}
        items={menuItems}
        style={{
          borderBottom: 'none',
          minWidth: 360,
          justifyContent: 'flex-end',
          fontSize: 14,
          fontWeight: 500,
        }}
      />
    </Header>
  );
};
