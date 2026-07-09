import { Link } from 'react-router-dom';
import { paths, sections } from '../routes/paths';

const popularAreas = [
  'Nairobi',
  'Westlands',
  'Kilimani',
  'South B',
  'Ruiru',
  'Thika',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Eldoret',
  'Ngong',
  'Kitengela',
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer footer-dark" id="contact">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to={paths.home} className="navbar-brand footer-brand-link">
              <span className="brand-mark" aria-hidden />
              MyUnits
            </Link>
            <p>
              MyUnits helps you search less and manage more — invoicing, tenants,
              and M-Pesa in one calm dashboard.
            </p>
          </div>

          <div className="footer-col">
            <h4>Contact us</h4>
            <ul>
              <li>
                <a href="mailto:hello@myunits.co.ke">hello@myunits.co.ke</a>
              </li>
              <li>
                <a href="tel:+254700000000">+254 700 000 000</a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li>
                <a href={sections.features}>Features</a>
              </li>
              <li>
                <a href={sections.benefits}>Benefits</a>
              </li>
              <li>
                <Link to={paths.register}>Get started</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Account</h4>
            <ul>
              <li>
                <Link to={paths.login}>Login</Link>
              </li>
              <li>
                <Link to={paths.register}>Sign up</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-towns">
          <h4>Popular areas in Kenya</h4>
          <ul className="footer-towns-list">
            {popularAreas.map((town) => (
              <li key={town}>
                <span>{town}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-bottom">
          <p>© {year} MyUnits. All rights reserved.</p>
          <p className="footer-bottom-tagline">
            Made for landlords who want property management faster, easier, and
            customized for you.
          </p>
        </div>
      </div>
    </footer>
  );
}
