import type { AuthUser } from '../types';

const ACCESS_KEY = 'myunits_access_token';
const REFRESH_KEY = 'myunits_refresh_token';
const USER_KEY = 'myunits_user';

export const session = {
  save(tokens: { accessToken: string; refreshToken: string }, user: AuthUser) {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getAccessToken: () => localStorage.getItem(ACCESS_KEY),
  getUser: (): AuthUser | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  },
};
