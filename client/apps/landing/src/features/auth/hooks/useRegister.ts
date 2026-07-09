import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { authApi } from '../api/auth.api';
import { paths } from '../../../routes/paths';

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const register = async (values: {
    fullName: string;
    email: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      const res = await authApi.register(values);
      message.success(res.message || 'Account created. Check your email to verify.');
      navigate(paths.login);
    } finally {
      setLoading(false);
    }
  };

  return { register, loading };
}
