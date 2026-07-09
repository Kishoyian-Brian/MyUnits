import { Button, Form, Input, message } from 'antd';
import { Link } from 'react-router-dom';
import { paths } from '../../../routes/paths';

type Values = { email: string; password: string };

type Props = {
  onSubmit: (values: Values) => Promise<void>;
  loading?: boolean;
};

export default function LoginForm({ onSubmit, loading }: Props) {
  const [form] = Form.useForm<Values>();

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={async (values) => {
        try {
          await onSubmit(values);
        } catch (e) {
          message.error(e instanceof Error ? e.message : 'Login failed');
        }
      }}
    >
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, type: 'email' }]}
      >
        <Input size="large" placeholder="you@example.com" />
      </Form.Item>
      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, min: 6 }]}
      >
        <Input.Password size="large" placeholder="••••••••" />
      </Form.Item>
      <div style={{ textAlign: 'right', marginBottom: 16 }}>
        <Link to={paths.forgotPassword}>Forgot password?</Link>
      </div>
      <Button type="primary" htmlType="submit" block size="large" loading={loading}>
        Log in
      </Button>
    </Form>
  );
}
