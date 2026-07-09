import { useState } from 'react';
import { authApi } from '../api/auth.api';
import { session } from '../utils/session';
import { postAuthRedirect } from '../utils/postAuthRedirect';

export function useLogin() {
  const [loading, setLoading] = useState(false);

  const login = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await authApi.login(values);
      session.save(
        { accessToken: res.accessToken, refreshToken: res.refreshToken },
        res.user,
      );
      postAuthRedirect(res.user.role);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
}
