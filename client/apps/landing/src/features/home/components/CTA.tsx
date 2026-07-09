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
            <Button size="large" style={{ background: '#fff', color: '#2563eb' }}>
              Create free account
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
