import { BankOutlined, TeamOutlined, WalletOutlined } from '@ant-design/icons';

const steps = [
  {
    number: '01',
    icon: <BankOutlined />,
    title: 'Add Your Properties',
    desc: 'Register your properties and define units with rent amounts, utility bills, and photos.',
  },
  {
    number: '02',
    icon: <TeamOutlined />,
    title: 'Onboard Tenants',
    desc: 'Add tenant details and create leases. Units are automatically marked as occupied.',
  },
  {
    number: '03',
    icon: <WalletOutlined />,
    title: 'Collect Payments',
    desc: 'Generate invoices, receive M-Pesa payments, and track who has paid at a glance.',
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works-section" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Get up and running in three simple steps.
          </p>
        </div>

        <div className="steps-container">
          {steps.map((step) => (
            <div className="step-card" key={step.number}>
              <div className="step-number">{step.number}</div>
              <div className="step-icon">{step.icon}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
