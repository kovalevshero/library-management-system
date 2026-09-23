import React from 'react';
import { Card, Typography } from 'antd';

const { Text, Title } = Typography;

export interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  accentColor = '#1d4ed8',
}) => {
  return (
    <Card
      size="small"
      style={{
        borderRadius: 8,
        border: '1px solid #e2e8f0',
        boxShadow: 'none',
        height: '100%',
      }}
      styles={{ body: { padding: '16px 20px' } }}
    >
      <Text
        type="secondary"
        style={{
          fontSize: 12,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#64748b',
          display: 'block',
          marginBottom: 4,
        }}
      >
        {title}
      </Text>
      <Title
        level={3}
        style={{
          margin: 0,
          fontWeight: 700,
          color: accentColor,
          lineHeight: 1.2,
        }}
      >
        {value}
      </Title>
      {subtitle && (
        <Text
          type="secondary"
          style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'block' }}
        >
          {subtitle}
        </Text>
      )}
    </Card>
  );
};
