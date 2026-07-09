import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthCard({ title, subtitle, children, footer }: Props) {
  return (
    <div className="auth-card-wrap">
      <div className="auth-card">
        <h1>{title}</h1>
        {subtitle && <p className="auth-card-sub">{subtitle}</p>}
        {children}
        {footer && <div className="auth-footer">{footer}</div>}
      </div>
    </div>
  );
}
