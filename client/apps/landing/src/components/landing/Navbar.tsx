import { Button, Space } from 'antd';
import {
  HomeOutlined,
  MenuOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useState } from 'react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Testimonials', href: '#testimonials' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="#" className="navbar-brand">
          <HomeOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          <span className="navbar-logo-text">MyUnits</span>
        </a>

        <ul className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="navbar-mobile-actions">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block href="#login">Log In</Button>
              <Button block type="primary" href="#get-started">Get Started</Button>
            </Space>
          </li>
        </ul>

        <Space className="navbar-actions">
          <Button href="#login">Log In</Button>
          <Button type="primary" href="#get-started">Get Started</Button>
        </Space>

        <button
          className="navbar-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <CloseOutlined /> : <MenuOutlined />}
        </button>
      </div>
    </nav>
  );
}
