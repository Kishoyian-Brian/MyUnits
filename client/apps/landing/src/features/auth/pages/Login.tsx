import { Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import LoginForm from '../forms/LoginForm';
import { useLogin } from '../hooks/useLogin';
import { paths } from '../../../routes/paths';

export default function Login() {
  const { login, loading } = useLogin();

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue to your dashboard."
      footer={
        <>
          Don&apos;t have an account? <Link to={paths.register}>Register</Link>
        </>
      }
    >
      <LoginForm onSubmit={login} loading={loading} />
    </AuthCard>
  );
}
