import { ConfigProvider } from 'antd';
import AppRoutes from './routes';

const theme = {
  token: {
    colorPrimary: '#2563eb',
    borderRadius: 8,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
};

export default function App() {
  return (
    <ConfigProvider theme={theme}>
      <AppRoutes />
    </ConfigProvider>
  );
}
