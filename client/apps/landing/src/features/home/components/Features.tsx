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
  { icon: <BankOutlined />, title: 'Property & Unit Management', desc: 'Add properties, define units, track vacancies.' },
  { icon: <TeamOutlined />, title: 'Tenant Management', desc: 'Store tenant details and search with ease.' },
  { icon: <FileProtectOutlined />, title: 'Lease Tracking', desc: 'Create leases and handle terminations.' },
  { icon: <FileTextOutlined />, title: 'Automated Invoicing', desc: 'Monthly invoices with rent and utilities.' },
  { icon: <WalletOutlined />, title: 'M-Pesa Payments', desc: 'Record payments and reconcile invoices.' },
  { icon: <ToolOutlined />, title: 'Maintenance Requests', desc: 'Track issues with photos and status.' },
  { icon: <DollarOutlined />, title: 'Expense Tracking', desc: 'Log repairs, insurance, taxes, and more.' },
  { icon: <DashboardOutlined />, title: 'Dashboard & Reports', desc: 'Revenue, occupancy, and summaries.' },
];

export default function Features() {
  return (
    <section className="features-section" id="features">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Everything You Need to Manage Rentals</h2>
          <p className="section-subtitle">
            From onboarding tenants to collecting payments, MyUnits handles it all.
          </p>
        </div>
        <Row gutter={[24, 24]}>
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
      </div>
    </section>
  );
}
