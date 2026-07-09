# Landing page — full development guide (with code)

Copy each file block into the path shown. Work **phase by phase** and run `pnpm dev:landing` after every phase.

**Architecture:** Auth lives only on landing. After login, users redirect to admin / landlord / tenant apps by role. See [../../docs/architecture.md](../../docs/architecture.md).

---

## Setup

```bash
cd client
pnpm install
cd apps/landing
pnpm add react-router-dom
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:3001/api/v1
VITE_ADMIN_APP_URL=http://localhost:5174
VITE_LANDLORD_APP_URL=http://localhost:5175
VITE_TENANT_APP_URL=http://localhost:5176
```

Update `index.html` — set title and font:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MyUnits — Property Management</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## Phase 1 — Routing shell

### `src/lib/env.ts`

```ts
export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1',
  adminAppUrl: import.meta.env.VITE_ADMIN_APP_URL ?? 'http://localhost:5174',
  landlordAppUrl: import.meta.env.VITE_LANDLORD_APP_URL ?? 'http://localhost:5175',
  tenantAppUrl: import.meta.env.VITE_TENANT_APP_URL ?? 'http://localhost:5176',
} as const;
```

### `src/routes/paths.ts`

```ts
export const paths = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',
} as const;

export const sections = {
  features: '/#features',
  howItWorks: '/#how-it-works',
  testimonials: '/#testimonials',
} as const;
```

### `src/routes/index.tsx`

```tsx
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingLayout from '../layouts/LandingLayout';
import AuthLayout from '../layouts/AuthLayout';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import ForgotPassword from '../features/auth/pages/ForgotPassword';
import ResetPassword from '../features/auth/pages/ResetPassword';
import VerifyEmail from '../features/auth/pages/VerifyEmail';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingLayout />}>
          <Route index element={<Home />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="verify-email" element={<VerifyEmail />} />
        </Route>

        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### `src/layouts/LandingLayout.tsx`

```tsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LandingLayout() {
  return (
    <div className="landing-shell">
      <Navbar />
      <main className="landing-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
```

### `src/layouts/AuthLayout.tsx`

```tsx
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
```

### `src/pages/Home.tsx` (placeholder until Phase 4)

```tsx
export default function Home() {
  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <h1>MyUnits</h1>
      <p>Home page — add sections in Phase 4.</p>
    </div>
  );
}
```

### `src/pages/NotFound.tsx`

```tsx
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { paths } from '../routes/paths';

export default function NotFound() {
  return (
    <div className="not-found">
      <p className="not-found-code">404</p>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to={paths.home}>
        <Button type="primary" size="large">
          Back to home
        </Button>
      </Link>
    </div>
  );
}
```

### `src/App.tsx`

```tsx
import { ConfigProvider } from 'antd';
import AppRoutes from './routes';

const theme = {
  token: {
    colorPrimary: '#2d6a6f',
    borderRadius: 8,
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
};

export default function App() {
  return (
    <ConfigProvider theme={theme}>
      <AppRoutes />
    </ConfigProvider>
  );
}
```

### `src/main.tsx`

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

### Phase 1 auth stubs (empty pages so routes compile)

Create these minimal files, then replace in Phase 6:

**`src/features/auth/pages/Login.tsx`**

```tsx
export default function Login() {
  return <div className="auth-card-wrap">Login — Phase 6</div>;
}
```

Repeat pattern for `Register.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`, `VerifyEmail.tsx`.

**Done when:** `/`, `/login`, `/404` all load without errors.

---

## Phase 2 — `src/styles/globals.css`

Create `src/styles/globals.css` with this full file (replaces `index.css` + `App.css` for layout):

```css
/* --- Design tokens --- */
:root {
  --color-bg: #f7f8f9;
  --color-surface: #ffffff;
  --color-text: #1c2b33;
  --color-text-muted: #5f6f78;
  --color-accent: #2d6a6f;
  --color-accent-hover: #245a5e;
  --color-accent-soft: #e8f2f1;
  --color-border: #e2e8ec;
  --font-sans: 'DM Sans', system-ui, sans-serif;
  --section-y: clamp(4rem, 8vw, 6rem);
  --container: min(1120px, calc(100% - 2rem));
  --shadow-sm: 0 1px 2px rgba(28, 43, 51, 0.06);
  --shadow-md: 0 8px 24px rgba(28, 43, 51, 0.08);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-text);
  background: var(--color-bg);
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--color-accent);
  text-decoration: none;
}

a:hover {
  color: var(--color-accent-hover);
}

.container {
  width: var(--container);
  margin-inline: auto;
}

.landing-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.landing-main {
  flex: 1;
}

/* --- Navbar --- */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-border);
}

.navbar-inner {
  width: var(--container);
  margin-inline: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 0;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--color-text);
}

.navbar-brand:hover {
  color: var(--color-text);
}

.brand-mark {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--color-accent), #3d8a8f);
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.navbar-links a {
  color: var(--color-text-muted);
  font-weight: 500;
  font-size: 0.9375rem;
}

.navbar-links a:hover {
  color: var(--color-accent);
}

.navbar-actions {
  display: flex;
  gap: 0.5rem;
}

.navbar-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--color-text);
}

.navbar-mobile-actions {
  display: none;
}

@media (max-width: 768px) {
  .navbar-toggle {
    display: block;
  }

  .navbar-actions {
    display: none;
  }

  .navbar-links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    gap: 0;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: 1rem;
  }

  .navbar-links.open {
    display: flex;
  }

  .navbar-links li {
    width: 100%;
    padding: 0.5rem 0;
  }

  .navbar-mobile-actions {
    display: block;
    width: 100%;
    margin-top: 0.5rem;
  }
}

/* --- Section headers --- */
.section-header {
  text-align: center;
  max-width: 640px;
  margin: 0 auto 3rem;
}

.section-title {
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 0.75rem;
  color: var(--color-text);
}

.section-subtitle {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 1.0625rem;
}

/* --- Hero --- */
.hero-section {
  padding: var(--section-y) 0;
  background:
    radial-gradient(ellipse 80% 50% at 50% -20%, var(--color-accent-soft), transparent),
    var(--color-bg);
}

.hero-section .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.hero-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.03em;
  margin: 0 0 1rem;
}

.hero-highlight {
  color: var(--color-accent);
}

.hero-subtitle {
  font-size: 1.125rem;
  color: var(--color-text-muted);
  margin: 0 0 1.75rem;
  max-width: 32rem;
}

.hero-mockup {
  background: var(--color-surface);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.mockup-header {
  display: flex;
  gap: 6px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.mockup-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-border);
}

.mockup-body {
  display: flex;
  min-height: 220px;
}

.mockup-sidebar {
  width: 56px;
  padding: 12px 8px;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mockup-nav-item {
  height: 8px;
  border-radius: 4px;
  background: var(--color-border);
}

.mockup-nav-item.active {
  background: var(--color-accent);
  opacity: 0.5;
}

.mockup-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mockup-card {
  height: 36px;
  border-radius: 6px;
  background: var(--color-accent-soft);
}

.mockup-table {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.mockup-row {
  height: 10px;
  border-radius: 4px;
  background: var(--color-border);
}

@media (max-width: 900px) {
  .hero-section .container {
    grid-template-columns: 1fr;
  }

  .hero-visual {
    order: -1;
  }
}

/* --- Features --- */
.features-section {
  padding: var(--section-y) 0;
  background: var(--color-surface);
}

.feature-card {
  height: 100%;
  border: 1px solid var(--color-border) !important;
  box-shadow: var(--shadow-sm) !important;
  transition: box-shadow 0.2s, transform 0.2s;
}

.feature-card:hover {
  box-shadow: var(--shadow-md) !important;
  transform: translateY(-2px);
}

.feature-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--color-accent-soft);
  color: var(--color-accent);
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

.feature-desc {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.9375rem;
}

/* --- How it works --- */
.how-it-works-section {
  padding: var(--section-y) 0;
}

.steps-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 960px;
  margin: 0 auto;
}

.step-card {
  text-align: center;
  padding: 1.5rem;
  position: relative;
}

.step-number {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--color-accent);
  margin-bottom: 0.75rem;
}

.step-icon {
  font-size: 1.75rem;
  color: var(--color-accent);
  margin-bottom: 1rem;
}

.step-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

.step-desc {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.9375rem;
}

@media (max-width: 768px) {
  .steps-container {
    grid-template-columns: 1fr;
  }
}

/* --- Testimonials --- */
.testimonials-section {
  padding: var(--section-y) 0;
  background: var(--color-surface);
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.testimonial-card {
  border: 1px solid var(--color-border) !important;
  height: 100%;
}

.testimonial-quote {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  margin: 1rem 0 1.25rem;
  line-height: 1.65;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.testimonial-name {
  font-weight: 600;
  font-size: 0.9375rem;
}

.testimonial-role {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

@media (max-width: 900px) {
  .testimonials-grid {
    grid-template-columns: 1fr;
  }
}

/* --- CTA --- */
.cta-section {
  padding: var(--section-y) 0;
}

.cta-inner {
  background: linear-gradient(135deg, var(--color-accent) 0%, #3d7a7f 100%);
  border-radius: 16px;
  padding: clamp(2.5rem, 5vw, 4rem);
  text-align: center;
  color: #fff;
}

.cta-inner h2 {
  color: #fff;
  margin: 0 0 0.75rem;
  font-size: clamp(1.5rem, 3vw, 2rem);
}

.cta-inner p {
  margin: 0 0 1.5rem;
  opacity: 0.9;
  max-width: 480px;
  margin-inline: auto;
}

/* --- Footer --- */
.footer {
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
  padding: 3rem 0 1.5rem;
  margin-top: auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-brand p {
  color: var(--color-text-muted);
  font-size: 0.9375rem;
  margin: 0.75rem 0 0;
  max-width: 280px;
}

.footer-col h4 {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.footer-col ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer-col li {
  margin-bottom: 0.5rem;
}

.footer-col a {
  color: var(--color-text);
  font-size: 0.9375rem;
}

.footer-bottom {
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* --- Auth --- */
.auth-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.auth-header {
  padding: 1.25rem 1.5rem;
}

.auth-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--color-text);
}

.auth-brand-mark {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--color-accent);
  display: inline-block;
}

.auth-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.auth-card-wrap {
  width: 100%;
  max-width: 420px;
}

.auth-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}

.auth-card h1 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
}

.auth-card-sub {
  margin: 0 0 1.5rem;
  color: var(--color-text-muted);
  font-size: 0.9375rem;
}

.auth-footer {
  margin-top: 1.25rem;
  text-align: center;
  font-size: 0.9375rem;
  color: var(--color-text-muted);
}

/* --- 404 --- */
.not-found {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.not-found-code {
  font-size: 4rem;
  font-weight: 700;
  color: var(--color-accent-soft);
  margin: 0;
  line-height: 1;
}
```

**Done when:** Sticky navbar, calm teal buttons, no blue Ant Design default.

---

## Phase 3 — Navbar & Footer

### `src/components/Navbar.tsx`

```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Space } from 'antd';
import { MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { paths, sections } from '../routes/paths';

const navLinks = [
  { label: 'Features', href: sections.features },
  { label: 'How It Works', href: sections.howItWorks },
  { label: 'Testimonials', href: sections.testimonials },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={paths.home} className="navbar-brand" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden />
          MyUnits
        </Link>

        <ul className={`navbar-links ${open ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
          <li className="navbar-mobile-actions">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Link to={paths.login} onClick={() => setOpen(false)}>
                <Button block>Log In</Button>
              </Link>
              <Link to={paths.register} onClick={() => setOpen(false)}>
                <Button block type="primary">
                  Get Started
                </Button>
              </Link>
            </Space>
          </li>
        </ul>

        <Space className="navbar-actions">
          <Link to={paths.login}>
            <Button>Log In</Button>
          </Link>
          <Link to={paths.register}>
            <Button type="primary">Get Started</Button>
          </Link>
        </Space>

        <button
          type="button"
          className="navbar-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <CloseOutlined /> : <MenuOutlined />}
        </button>
      </div>
    </nav>
  );
}
```

### `src/components/Footer.tsx`

```tsx
import { Link } from 'react-router-dom';
import { paths, sections } from '../routes/paths';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to={paths.home} className="navbar-brand">
              <span className="brand-mark" aria-hidden />
              MyUnits
            </Link>
            <p>Smart property management for Kenyan landlords.</p>
          </div>

          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li>
                <a href={sections.features}>Features</a>
              </li>
              <li>
                <a href={sections.howItWorks}>How it works</a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Account</h4>
            <ul>
              <li>
                <Link to={paths.login}>Log in</Link>
              </li>
              <li>
                <Link to={paths.register}>Register</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li>
                <a href="mailto:hello@myunits.co.ke">hello@myunits.co.ke</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">© {year} MyUnits. All rights reserved.</div>
      </div>
    </footer>
  );
}
```

---

## Phase 4 — Home sections

### `src/pages/Home.tsx`

```tsx
import Hero from '../features/home/components/Hero';
import Features from '../features/home/components/Features';
import HowItWorks from '../features/home/components/HowItWorks';
import Testimonials from '../features/home/components/Testimonials';
import CTA from '../features/home/components/CTA';

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
    </>
  );
}
```

### `src/features/home/components/Hero.tsx`

```tsx
import { Link } from 'react-router-dom';
import { Button, Space } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { paths, sections } from '../../../routes/paths';

export default function Hero() {
  return (
    <section className="hero-section" id="hero">
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">
            Smart Property Management
            <br />
            <span className="hero-highlight">for Kenyan Landlords</span>
          </h1>
          <p className="hero-subtitle">
            Manage properties, automate rent invoicing, collect M-Pesa payments,
            and keep tenants happy — all from one calm dashboard.
          </p>
          <Space size="middle" wrap className="hero-actions">
            <Link to={paths.register}>
              <Button type="primary" size="large">
                Get Started Free <ArrowRightOutlined />
              </Button>
            </Link>
            <a href={sections.howItWorks}>
              <Button size="large">See How It Works</Button>
            </a>
          </Space>
        </div>

        <div className="hero-visual">
          <div className="hero-mockup" aria-hidden>
            <div className="mockup-header">
              <span className="mockup-dot" />
              <span className="mockup-dot" />
              <span className="mockup-dot" />
            </div>
            <div className="mockup-body">
              <div className="mockup-sidebar">
                <div className="mockup-nav-item active" />
                <div className="mockup-nav-item" />
                <div className="mockup-nav-item" />
              </div>
              <div className="mockup-content">
                <div className="mockup-card" />
                <div className="mockup-card" />
                <div className="mockup-table">
                  <div className="mockup-row" />
                  <div className="mockup-row" />
                  <div className="mockup-row" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### `src/features/home/components/Features.tsx`

Copy from your existing `src/components/landing/Features.tsx` — only change: wrap section in `<div className="container">` inside `features-section`.

### `src/features/home/components/HowItWorks.tsx`

Copy from `src/components/landing/HowItWorks.tsx` + add `container` wrapper.

### `src/features/home/components/Testimonials.tsx`

Copy from `src/components/landing/Testimonials.tsx` + add `container` wrapper.

### `src/features/home/components/CTA.tsx`

```tsx
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { paths } from '../../../routes/paths';

export default function CTA() {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-inner">
          <h2>Ready to simplify your rentals?</h2>
          <p>
            Join landlords across Kenya who manage units, invoices, and M-Pesa
            payments in one place.
          </p>
          <Link to={paths.register}>
            <Button size="large" style={{ background: '#fff', color: '#2d6a6f' }}>
              Create free account
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
```

**Full Features.tsx** (if you prefer one file here):

```tsx
import { Card, Col, Row } from 'antd';
import {
  BankOutlined,
  TeamOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  WalletOutlined,
  ToolOutlined,
  DollarOutlined,
  DashboardOutlined,
} from '@ant-design/icons';

const features = [
  { icon: <BankOutlined />, title: 'Property & Unit Management', desc: 'Add properties, define units, track vacancies.' },
  { icon: <TeamOutlined />, title: 'Tenant Management', desc: 'Store tenant details and search with ease.' },
  { icon: <FileProtectOutlined />, title: 'Lease Tracking', desc: 'Create leases and handle terminations.' },
  { icon: <FileTextOutlined />, title: 'Automated Invoicing', desc: 'Monthly invoices with rent and utilities.' },
  { icon: <WalletOutlined />, title: 'M-Pesa Payments', desc: 'Record payments and reconcile invoices.' },
  { icon: <ToolOutlined />, title: 'Maintenance Requests', desc: 'Track issues with photos and status.' },
  { icon: <DollarOutlined />, title: 'Expense Tracking', desc: 'Log repairs, insurance, taxes, and more.' },
  { icon: <DashboardOutlined />, title: 'Dashboard & Reports', desc: 'Revenue, occupancy, and summaries.' },
];

export default function Features() {
  return (
    <section className="features-section" id="features">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Everything You Need to Manage Rentals</h2>
          <p className="section-subtitle">
            From onboarding tenants to collecting payments, MyUnits handles it all.
          </p>
        </div>
        <Row gutter={[24, 24]}>
          {features.map((f) => (
            <Col xs={24} sm={12} lg={6} key={f.title}>
              <Card className="feature-card" bordered={false}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
}
```

---

## Phase 5 — Auth UI (no API yet)

### `src/features/auth/components/AuthCard.tsx`

```tsx
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
```

### `src/features/auth/forms/LoginForm.tsx`

```tsx
import { Button, Form, Input, message } from 'antd';
import { Link } from 'react-router-dom';
import { paths } from '../../../routes/paths';

type Values = { email: string; password: string };

type Props = {
  onSubmit: (values: Values) => Promise<void>;
  loading?: boolean;
};

export default function LoginForm({ onSubmit, loading }: Props) {
  const [form] = Form.useForm<Values>();

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={async (values) => {
        try {
          await onSubmit(values);
        } catch (e) {
          message.error(e instanceof Error ? e.message : 'Login failed');
        }
      }}
    >
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, type: 'email' }]}
      >
        <Input size="large" placeholder="you@example.com" />
      </Form.Item>
      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, min: 6 }]}
      >
        <Input.Password size="large" placeholder="••••••••" />
      </Form.Item>
      <div style={{ textAlign: 'right', marginBottom: 16 }}>
        <Link to={paths.forgotPassword}>Forgot password?</Link>
      </div>
      <Button type="primary" htmlType="submit" block size="large" loading={loading}>
        Log in
      </Button>
    </Form>
  );
}
```

### `src/features/auth/pages/Login.tsx`

```tsx
import { Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import LoginForm from '../forms/LoginForm';
import { paths } from '../../../routes/paths';

export default function Login() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue to your dashboard."
      footer={
        <>
          Don&apos;t have an account? <Link to={paths.register}>Register</Link>
        </>
      }
    >
      <LoginForm
        onSubmit={async (values) => {
          console.log('Login', values);
          // Phase 7: call useLogin()
        }}
      />
    </AuthCard>
  );
}
```

Create similar pages:
- **Register** — `RegisterForm` with fullName, email, password → `paths.login` link in footer
- **ForgotPassword** — email only
- **ResetPassword** — email, otp (6 chars), newPassword
- **VerifyEmail** — read `token` from `useSearchParams()`, submit on mount or button

---

## Phase 6 — API layer

### `src/lib/axios.ts`

```ts
import { env } from './env';

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${env.apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      typeof data === 'object' && data && 'message' in data
        ? String((data as { message: string | string[] }).message)
        : res.statusText;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
  }

  return data as T;
}
```

### `src/features/auth/types.ts`

```ts
export type UserRole = 'ADMIN' | 'LANDLORD' | 'USER';

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phoneNumber?: string | null;
  isEmailVerified: boolean;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};
```

### `src/features/auth/api/auth.api.ts`

```ts
import { api } from '../../../lib/axios';
import type { AuthUser, LoginResponse } from '../types';

export const authApi = {
  login: (body: { email: string; password: string }) =>
    api<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  register: (body: { fullName: string; email: string; password: string }) =>
    api<{ message: string; user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  forgotPassword: (body: { email: string }) =>
    api<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  resetPassword: (body: { email: string; otp: string; newPassword: string }) =>
    api<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  verifyEmail: (body: { token: string }) =>
    api<{ message: string; user: AuthUser }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
```

### `src/features/auth/utils/session.ts`

```ts
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
```

### `src/features/auth/utils/postAuthRedirect.ts`

```ts
import { env } from '../../../lib/env';
import type { UserRole } from '../types';

export function postAuthRedirect(role: UserRole) {
  const map: Record<UserRole, string> = {
    ADMIN: env.adminAppUrl,
    LANDLORD: env.landlordAppUrl,
    USER: env.tenantAppUrl,
  };
  window.location.href = map[role] ?? env.landlordAppUrl;
}
```

### `src/features/auth/hooks/useLogin.ts`

```ts
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
```

### Wire `Login.tsx` (Phase 7)

```tsx
import { Link } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import LoginForm from '../forms/LoginForm';
import { useLogin } from '../hooks/useLogin';
import { paths } from '../../../routes/paths';

export default function Login() {
  const { login, loading } = useLogin();

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to continue to your dashboard."
      footer={
        <>
          Don&apos;t have an account? <Link to={paths.register}>Register</Link>
        </>
      }
    >
      <LoginForm onSubmit={login} loading={loading} />
    </AuthCard>
  );
}
```

---

## Phase 7 — Cleanup

1. Delete `src/App.css`, `src/index.css` if unused.
2. Delete `src/components/landing/` after copying to `features/home/components/`.
3. Run `pnpm build` inside `apps/landing`.

---

## Checklist (landing complete)

- [ ] Phase 1: routing works
- [ ] Phase 2–3: calm UI, navbar, footer
- [ ] Phase 4: all home sections + CTA
- [ ] Phase 5–6: all auth forms
- [ ] Phase 7: login → API → redirect by role
- [ ] Build passes

---

## File tree (final)

```
apps/landing/src/
├── App.tsx
├── main.tsx
├── routes/ (paths.ts, index.tsx)
├── layouts/ (LandingLayout, AuthLayout)
├── pages/ (Home, NotFound)
├── components/ (Navbar, Footer)
├── features/
│   ├── home/components/ (Hero, Features, HowItWorks, Testimonials, CTA)
│   └── auth/ (api, hooks, forms, pages, components, utils, types.ts)
├── lib/ (env.ts, axios.ts)
└── styles/globals.css
```

**Next:** Landlord app — `SessionProvider` reads `myunits_*` keys from localStorage; no login page.
