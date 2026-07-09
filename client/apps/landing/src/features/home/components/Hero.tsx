import { useNavigate } from 'react-router-dom';
import { Button, Col, Form, Input, Row, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { paths } from '../../../routes/paths';
import heroImage from '../../../assets/hero/apt-1.jpg';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero-banner" id="hero">
      <img className="hero-banner-image" src={heroImage} alt="" aria-hidden />
      <div className="hero-banner-scrim" aria-hidden />

      <div className="container hero-banner-content">
        <h1 className="hero-banner-title">
          Manage rentals smarter across Kenya
        </h1>
        <p className="hero-banner-subtitle">
          Invoicing, M-Pesa tracking, tenants, and maintenance — one dashboard
          for landlords and property managers.
        </p>

        <div className="hero-search-panel">
          <p className="hero-search-label">Start managing your portfolio</p>
          <Form layout="vertical" onFinish={() => navigate(paths.register)}>
            <Row gutter={[12, 12]}>
              <Col xs={24} md={8}>
                <Form.Item label="Location" name="location">
                  <Input size="large" placeholder="e.g. Westlands, Nairobi" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Units" name="units">
                  <Select
                    size="large"
                    placeholder="Number of units"
                    options={[
                      { value: '1-5', label: '1–5 units' },
                      { value: '6-20', label: '6–20 units' },
                      { value: '21+', label: '21+ units' },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="Email" name="email" rules={[{ type: 'email' }]}>
                  <Input size="large" placeholder="you@example.com" />
                </Form.Item>
              </Col>
            </Row>
            <div className="hero-search-actions">
              <Button type="primary" size="large" icon={<SearchOutlined />} htmlType="submit">
                Get Started Free
              </Button>
              <span className="hero-search-hint">No credit card required</span>
            </div>
          </Form>
        </div>
      </div>
    </section>
  );
}
