import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, message, Spin } from 'antd';
import AuthCard from '../components/AuthCard';
import { useVerifyEmail } from '../hooks/useVerifyEmail';
import { paths } from '../../../routes/paths';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { verifyEmail, loading } = useVerifyEmail();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const hasStarted = useRef(false);

  const verify = useCallback(async () => {
    if (!token) {
      message.error('Missing verification token.');
      setStatus('error');
      return;
    }

    try {
      await verifyEmail(token);
      setStatus('success');
      message.success('Email verified. You can log in now.');
    } catch (e) {
      setStatus('error');
      message.error(e instanceof Error ? e.message : 'Verification failed');
    }
  }, [token, verifyEmail]);

  useEffect(() => {
    if (!token || hasStarted.current) return;
    hasStarted.current = true;

    const timeoutId = window.setTimeout(() => {
      void verify();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [token, verify]);

  return (
    <AuthCard
      title="Verify your email"
      subtitle={
        token
          ? 'Confirming your email address…'
          : 'Open the link from your email to verify your account.'
      }
      footer={
        <>
          Back to <Link to={paths.login}>log in</Link>
        </>
      }
    >
      {!token && (
        <p className="auth-muted-text">
          No token found in the URL. Check your inbox for the verification link.
        </p>
      )}

      {token && loading && (
        <div className="auth-center">
          <Spin size="large" />
        </div>
      )}

      {token && !loading && status === 'success' && (
        <p className="auth-muted-text">
          Your email has been verified. You can now log in.
        </p>
      )}

      {token && !loading && status === 'error' && (
        <Button type="primary" block size="large" onClick={() => void verify()}>
          Try again
        </Button>
      )}
    </AuthCard>
  );
}
