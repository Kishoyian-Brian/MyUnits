import { Layout, Typography } from 'antd';

const { Header, Content } = Layout;

export default function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <Typography.Text style={{ color: '#fff', fontWeight: 600 }}>
          MyUnits Admin
        </Typography.Text>
      </Header>
      <Content style={{ padding: 24 }}>
        <Typography.Title level={2}>Admin app scaffold</Typography.Title>
        <Typography.Paragraph>
          This is a placeholder app created as part of the monorepo folder
          structure. Next we will add routing, auth, and admin pages.
        </Typography.Paragraph>
      </Content>
    </Layout>
  );
}

