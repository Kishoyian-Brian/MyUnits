import { Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import ForgotPasswordForm from '../forms/ForgotPasswordForm';
import { useForgotPassword } from '../hooks/useForgotPassword';
import { paths } from '../../../routes/paths';

export default function ForgotPassword() {
  const { forgotPassword, loading } = useForgotPassword();

  return (
    <AuthCard
      title="Forgot password"
      subtitle="Enter your email and we will send you a reset code."
      footer={
        <>
          Remember your password? <Link to={paths.login}>Log in</Link>
        </>
      }
    >
      <ForgotPasswordForm onSubmit={forgotPassword} loading={loading} />
    </AuthCard>
  );
}
