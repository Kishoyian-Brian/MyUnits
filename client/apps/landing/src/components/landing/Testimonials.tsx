import { Card, Avatar, Rate } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const testimonials = [
  {
    name: 'James Mwangi',
    role: 'Landlord, Nairobi',
    quote:
      'MyUnits transformed how I manage my 3 rental properties. Invoicing used to take hours — now it is automatic.',
    rating: 5,
  },
  {
    name: 'Grace Otieno',
    role: 'Property Manager, Mombasa',
    quote:
      'The M-Pesa tracking is a game-changer. I always know who has paid and who has not, without chasing tenants.',
    rating: 5,
  },
  {
    name: 'David Kimani',
    role: 'Landlord, Kisumu',
    quote:
      'Maintenance requests used to get lost in WhatsApp messages. Now everything is tracked in one place.',
    rating: 4,
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials-section" id="testimonials">
      <div className="section-header">
        <h2 className="section-title">Trusted by Landlords Across Kenya</h2>
        <p className="section-subtitle">
          See what property owners are saying about MyUnits.
        </p>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((t) => (
          <Card className="testimonial-card" bordered={false} key={t.name}>
            <Rate disabled defaultValue={t.rating} className="testimonial-rating" />
            <p className="testimonial-quote">"{t.quote}"</p>
            <div className="testimonial-author">
              <Avatar size={44} icon={<UserOutlined />} className="testimonial-avatar" />
              <div>
                <div className="testimonial-name">{t.name}</div>
                <div className="testimonial-role">{t.role}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
