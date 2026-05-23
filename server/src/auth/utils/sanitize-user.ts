const SENSITIVE_FIELDS = [
  'password',
  'refreshToken',
  'resetPasswordToken',
  'resetPasswordExpires',
  'emailVerificationToken',
] as const;

type SensitiveField = (typeof SENSITIVE_FIELDS)[number];

export type SafeUser<T> = Omit<T, SensitiveField>;

export function sanitizeUser<T extends Record<SensitiveField, unknown>>(
  user: T,
): SafeUser<T> {
  const safe = { ...user };
  for (const field of SENSITIVE_FIELDS) {
    delete safe[field];
  }
  return safe as SafeUser<T>;
}
