import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { authApi } from '../api/auth.api';
import { paths } from '../../../routes/paths';

export function useResetPassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const resetPassword = async (values: {
    email: string;
    otp: string;
    newPassword: string;
  }) => {
    setLoading(true);
    try {
      const res = await authApi.resetPassword(values);
      message.success(res.message || 'Password reset. You can log in now.');
      navigate(paths.login);
    } finally {
      setLoading(false);
    }
  };

  return { resetPassword, loading };
}
