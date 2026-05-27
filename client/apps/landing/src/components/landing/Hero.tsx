import { Button, Space } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';

export default function Hero() {
  return (
    <section className="hero-section" id="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Smart Property Management
          <br />
          <span className="hero-highlight">for Kenyan Landlords</span>
        </h1>
        <p className="hero-subtitle">
          Manage your properties, automate rent invoicing, collect M-Pesa
          payments, and keep tenants happy — all from one dashboard.
        </p>
        <Space size="middle" wrap className="hero-actions">
          <Button type="primary" size="large" href="#get-started">
            Get Started Free <ArrowRightOutlined />
          </Button>
          <Button size="large" href="#how-it-works">
            See How It Works
          </Button>
        </Space>
      </div>

      <div className="hero-visual">
        <div className="hero-mockup">
          <div className="mockup-header">
            <span className="mockup-dot" />
            <span className="mockup-dot" />
            <span className="mockup-dot" />
          </div>
          <div className="mockup-body">
            <div className="mockup-sidebar">
              <div className="mockup-nav-item active" />
              <div className="mockup-nav-item" />
              <div className="mockup-nav-item" />
              <div className="mockup-nav-item" />
              <div className="mockup-nav-item" />
            </div>
            <div className="mockup-content">
              <div className="mockup-card" />
              <div className="mockup-card" />
              <div className="mockup-card" />
              <div className="mockup-table">
                <div className="mockup-row" />
                <div className="mockup-row" />
                <div className="mockup-row" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
