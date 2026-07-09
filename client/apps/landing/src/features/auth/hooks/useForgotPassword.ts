import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { authApi } from '../api/auth.api';
import { paths } from '../../../routes/paths';

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const forgotPassword = async (values: { email: string }) => {
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(values);
      message.success(res.message || 'Reset code sent. Check your email.');
      navigate(`${paths.resetPassword}?email=${encodeURIComponent(values.email)}`);
    } finally {
      setLoading(false);
    }
  };

  return { forgotPassword, loading };
}
