import { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';

export default function Newsletter() {
  const [loading, setLoading] = useState(false);

  return (
    <section className="newsletter-section" id="newsletter">
      <div className="container">
        <div className="newsletter-inner">
          <div className="newsletter-icon-wrap">
            <MailOutlined className="newsletter-icon" />
          </div>
          <div className="newsletter-content">
            <h2 className="newsletter-title">Newsletter</h2>
            <p className="newsletter-subtitle">
              Sign up for tips on rent collection, M-Pesa reconciliation, and
              property management in Kenya.
            </p>
            <Form
              layout="inline"
              className="newsletter-form"
              onFinish={async (values) => {
                setLoading(true);
                try {
                  await new Promise((r) => setTimeout(r, 600));
                  message.success(`Thanks! We'll be in touch at ${values.email}.`);
                } finally {
                  setLoading(false);
                }
              }}
            >
              <Form.Item
                name="email"
                rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Input size="large" placeholder="Your email address" />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" size="large" htmlType="submit" loading={loading}>
                  Subscribe
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
