import { Link, Outlet } from 'react-router-dom';
import { paths } from '../routes/paths';

export default function AuthLayout() {
  return (
    <div className="auth-shell">
      <header className="auth-header">
        <Link to={paths.home} className="auth-brand">
          <span className="auth-brand-mark" aria-hidden />
          MyUnits
        </Link>
      </header>
      <main className="auth-main">
        <Outlet />
      </main>
    </div>
  );
}
