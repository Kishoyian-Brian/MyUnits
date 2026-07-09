import { Button, Form, Input, message } from 'antd';

type Values = { email: string; otp: string; newPassword: string };

type Props = {
  onSubmit: (values: Values) => Promise<void>;
  loading?: boolean;
  defaultEmail?: string;
};

export default function ResetPasswordForm({ onSubmit, loading, defaultEmail }: Props) {
  const [form] = Form.useForm<Values>();

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ email: defaultEmail }}
      onFinish={async (values) => {
        try {
          await onSubmit(values);
        } catch (e) {
          message.error(e instanceof Error ? e.message : 'Reset failed');
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
        name="otp"
        label="Reset code"
        rules={[{ required: true, len: 6 }]}
      >
        <Input size="large" placeholder="123456" maxLength={6} />
      </Form.Item>
      <Form.Item
        name="newPassword"
        label="New password"
        rules={[{ required: true, min: 8 }]}
      >
        <Input.Password size="large" placeholder="••••••••" />
      </Form.Item>
      <Button type="primary" htmlType="submit" block size="large" loading={loading}>
        Reset password
      </Button>
    </Form>
  );
}
