import { Button, Form, Input, message } from 'antd';

type Values = { fullName: string; email: string; password: string };

type Props = {
  onSubmit: (values: Values) => Promise<void>;
  loading?: boolean;
};

export default function RegisterForm({ onSubmit, loading }: Props) {
  const [form] = Form.useForm<Values>();

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={async (values) => {
        try {
          await onSubmit(values);
        } catch (e) {
          message.error(e instanceof Error ? e.message : 'Registration failed');
        }
      }}
    >
      <Form.Item
        name="fullName"
        label="Full name"
        rules={[{ required: true, min: 2 }]}
      >
        <Input size="large" placeholder="Jane Doe" />
      </Form.Item>
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
        rules={[{ required: true, min: 8 }]}
      >
        <Input.Password size="large" placeholder="••••••••" />
      </Form.Item>
      <Button type="primary" htmlType="submit" block size="large" loading={loading}>
        Create account
      </Button>
    </Form>
  );
}
