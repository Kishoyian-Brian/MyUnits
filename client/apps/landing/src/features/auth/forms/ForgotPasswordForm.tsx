import { Button, Form, Input, message } from 'antd';

type Values = { email: string };

type Props = {
  onSubmit: (values: Values) => Promise<void>;
  loading?: boolean;
};

export default function ForgotPasswordForm({ onSubmit, loading }: Props) {
  const [form] = Form.useForm<Values>();

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={async (values) => {
        try {
          await onSubmit(values);
        } catch (e) {
          message.error(e instanceof Error ? e.message : 'Request failed');
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
      <Button type="primary" htmlType="submit" block size="large" loading={loading}>
        Send reset code
      </Button>
    </Form>
  );
}
