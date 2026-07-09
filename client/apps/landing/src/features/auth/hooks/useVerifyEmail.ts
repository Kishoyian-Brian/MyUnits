import { useState } from 'react';
import { authApi } from '../api/auth.api';

export function useVerifyEmail() {
  const [loading, setLoading] = useState(false);

  const verifyEmail = async (token: string) => {
    setLoading(true);
    try {
      const res = await authApi.verifyEmail({ token });
      return res;
    } finally {
      setLoading(false);
    }
  };

  return { verifyEmail, loading };
}
