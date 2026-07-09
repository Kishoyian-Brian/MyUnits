import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Space } from 'antd';
import { MenuOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { paths, sections } from '../routes/paths';

const navLinks = [
  { label: 'Features', href: sections.features },
  { label: 'Benefits', href: sections.benefits },
  { label: 'Reviews', href: sections.testimonials },
  { label: 'Contact', href: sections.contact },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
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
              <Link to={paths.register} onClick={() => setOpen(false)}>
                <Button block type="primary" icon={<PlusOutlined />}>
                  Get Started
                </Button>
              </Link>
            </li>
          </ul>

          <Space className="navbar-actions" size="middle">
            <Link to={paths.register}>
              <Button type="primary" icon={<PlusOutlined />} className="navbar-cta">
                Get Started
              </Button>
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
    </header>
  );
}
