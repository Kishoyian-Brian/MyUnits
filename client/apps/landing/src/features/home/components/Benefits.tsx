import {
  DashboardOutlined,
  SafetyCertificateOutlined,
  WalletOutlined,
} from '@ant-design/icons';

const benefits = [
  {
    icon: <DashboardOutlined />,
    title: 'Real-time dashboard',
    desc: 'Track occupancy, rent due, and payments as they happen. Your portfolio updates automatically when tenants pay or new leases start — no spreadsheets.',
    reverse: false,
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: 'Verified records',
    desc: 'Keep tenant details, leases, and invoices in one trusted place. Every payment is tied to an invoice so you always know who has paid and who has not.',
    reverse: true,
  },
  {
    icon: <WalletOutlined />,
    title: 'Peace of mind',
    desc: 'Automate monthly invoicing, record M-Pesa payments, and reconcile balances in minutes. MyUnits works on any device, wherever you manage from.',
    reverse: false,
  },
];

export default function Benefits() {
  return (
    <section className="benefits-section" id="benefits">
      <div className="container">
        {benefits.map((b) => (
          <div
            className={`benefit-row ${b.reverse ? 'benefit-row-reverse' : ''}`}
            key={b.title}
          >
            <div className="benefit-visual">
              <div className="benefit-icon-wrap">{b.icon}</div>
            </div>
            <div className="benefit-content">
              <h3 className="benefit-title">{b.title}</h3>
              <p className="benefit-desc">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
