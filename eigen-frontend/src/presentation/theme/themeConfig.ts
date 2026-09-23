import { ThemeConfig } from 'antd';

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#1d4ed8', // Accessible cobalt blue
    colorInfo: '#1d4ed8',
    colorSuccess: '#15803d', // High-contrast forest green
    colorWarning: '#b45309', // High-contrast amber
    colorError: '#b91c1c', // High-contrast crimson
    colorTextBase: '#0f172a', // Deep slate for sharp contrast
    colorBgBase: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    borderRadius: 6,
    wireframe: false,
  },
  components: {
    Button: {
      controlHeight: 36,
      borderRadius: 6,
    },
    Table: {
      headerBg: '#f8fafc',
      headerColor: '#334155',
      rowHoverBg: '#f1f5f9',
    },
    Card: {
      borderRadiusLG: 8,
    },
    Tag: {
      borderRadiusSM: 4,
    },
  },
};
