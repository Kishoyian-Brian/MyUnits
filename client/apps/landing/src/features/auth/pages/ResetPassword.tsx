import { Link, useSearchParams } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import ResetPasswordForm from '../forms/ResetPasswordForm';
import { useResetPassword } from '../hooks/useResetPassword';
import { paths } from '../../../routes/paths';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? undefined;
  const { resetPassword, loading } = useResetPassword();

  return (
    <AuthCard
      title="Reset password"
      subtitle="Enter the code from your email and choose a new password."
      footer={
        <>
          Back to <Link to={paths.login}>log in</Link>
        </>
      }
    >
      <ResetPasswordForm
        defaultEmail={email}
        onSubmit={resetPassword}
        loading={loading}
      />
    </AuthCard>
  );
}
