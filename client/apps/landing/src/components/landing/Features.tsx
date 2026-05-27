import { Card, Col, Row } from 'antd';
import {
  BankOutlined,
  TeamOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  WalletOutlined,
  ToolOutlined,
  DollarOutlined,
  DashboardOutlined,
} from '@ant-design/icons';

const features = [
  {
    icon: <BankOutlined />,
    title: 'Property & Unit Management',
    desc: 'Add properties, define units, set rent amounts, and track vacancies in real time.',
  },
  {
    icon: <TeamOutlined />,
    title: 'Tenant Management',
    desc: 'Store tenant details, contact info, and national IDs. Search and filter with ease.',
  },
  {
    icon: <FileProtectOutlined />,
    title: 'Lease Tracking',
    desc: 'Create leases, link tenants to units, track start and end dates, and handle terminations.',
  },
  {
    icon: <FileTextOutlined />,
    title: 'Automated Invoicing',
    desc: 'Generate monthly invoices with rent and utility breakdowns. Track payment status.',
  },
  {
    icon: <WalletOutlined />,
    title: 'M-Pesa Payments',
    desc: 'Record M-Pesa payments with transaction codes. Auto-reconcile invoices when paid.',
  },
  {
    icon: <ToolOutlined />,
    title: 'Maintenance Requests',
    desc: 'Tenants report issues with photos. Track priority, status, and resolution.',
  },
  {
    icon: <DollarOutlined />,
    title: 'Expense Tracking',
    desc: 'Log property expenses by category — repairs, insurance, taxes, utilities, and more.',
  },
  {
    icon: <DashboardOutlined />,
    title: 'Dashboard & Reports',
    desc: 'See revenue trends, occupancy rates, and financial summaries at a glance.',
  },
];

export default function Features() {
  return (
    <section className="features-section" id="features">
      <div className="section-header">
        <h2 className="section-title">Everything You Need to Manage Rentals</h2>
        <p className="section-subtitle">
          From onboarding tenants to collecting payments, MyUnits handles it all.
        </p>
      </div>

      <Row gutter={[24, 24]} className="features-grid">
        {features.map((f) => (
          <Col xs={24} sm={12} lg={6} key={f.title}>
            <Card className="feature-card" bordered={false}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
}
