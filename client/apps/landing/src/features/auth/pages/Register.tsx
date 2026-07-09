import { Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import RegisterForm from '../forms/RegisterForm';
import { useRegister } from '../hooks/useRegister';
import { paths } from '../../../routes/paths';

export default function Register() {
  const { register, loading } = useRegister();

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start managing your properties in minutes."
      footer={
        <>
          Already have an account? <Link to={paths.login}>Log in</Link>
        </>
      }
    >
      <RegisterForm onSubmit={register} loading={loading} />
    </AuthCard>
  );
}
